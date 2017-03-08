HTTP.methods({
    '/getRevisionFile': {
        auth: SarHelper.myAuth,
        get: function () {
            let query = SarHelper.getQuery(this.query);
            if (typeof query === 'string') {
                return query;
            }
            let ret = Sar.findOne(query, {sort: {rev: -1}});
            if (ret && ret.class !== 'OBSOLETE') {
                return ret.fileContent;
            } else {
                return 'ERROR: Not found';
            }
        }
    },
    '/getRevisionActions': {
        auth: SarHelper.myAuth,
        get: function () {
            let query = SarHelper.getQuery(this.query);
            if (typeof query === 'string') {
                return query;
            }
            let sar = Sar.findOne(query, {sort: {rev: -1}});
            return SarHelper.getActions(sar._id);
        }
    },
    '/getRevisionSpecs': {
        auth: SarHelper.myAuth,
        get: function () {
            let query = SarHelper.getQuery(this.query);
            if (typeof query === 'string') {
                return query;
            }
            let sar = Sar.findOne(query, {sort: {rev: -1}});
            return SarHelper.getSpecs(sar._id);
        }
    },
    '/getTransceiverStatus': {
        auth: SarHelper.myAuth,
        get: function () {
            let sn = this.query.sn.toUpperCase();

            let testSumm = Testsummary.findOne(
                {
                    sn: sn,
                    tsts: {
                        $nin: ['packout - packout']
                    }
                }, {
                    sort: {
                        d: -1
                    }
                });

            if (testSumm) {
                return testSumm;
            } else {
                let packout = Testdata.findOne(
                    {
                        'device.SerialNumber': sn,
                        type: 'packout',
                        subtype: 'packout'
                    }, {
                        sort: {
                            'meta.StartDateTime': -1
                        }
                    });
                if (packout) {
                    sn = packout.device.ManufSn || packout.device.SerialNumber;
                }
                return Testsummary.findOne(
                    {
                        sn: sn,
                        tsts: {
                            $nin: ['packout - packout']
                        }
                    }, {
                        sort: {
                            d: -1
                        }
                    });
            }
        }
    },


    '/getDomain': {
        auth: SarHelper.myAuth,
        get: function () {
            let domain = Domains.findOne({_id: this.query.id}, {fields: {audit: 0}});
            return domain;
        }
    },

    '/getRosaRework': {
        auth: SarHelper.myAuth,
        get: function () {
            let domain = Domains.findOne({'dc.ROSA': this.query.id}, {fields: {audit: 0}});
            if (!domain) {
                return 'not_found';
            }
            if (domain.dc.rosaRework === true) {
                return 'true';
            } else {
                return 'false';
            }
        }
    },

    '/getConvBin': {
        auth: SarHelper.myAuth,
        get: function () {
            let pnum = this.query.pnum.toUpperCase();
            let sarSpecBin = SarSpecBin.findOne({pnumLink: pnum});
            if (sarSpecBin) {
                return [sarSpecBin.class, sarSpecBin.pnum];
            }
            return [];
        }
    },



    '/postAssembly': {
        auth: SarHelper.myAuth,
        post: function (postData) {
            const ASSEMBLY_LOCATION_ID = 'YPYBAODLJ';
            let data = JSON.parse(postData);
            let action = this.query.action;
            let user = this.query.user;
            let returnErrors = [];

            // query.action = 'CHECK', 'INSERT'
            // [
            //     {
            //         cm:
            //         pnum:
            //         sn:
            //         sncm:
            //         shipDate:
            //         TOSA:
            //         ROSA:
            //         PCBA:
            //     }, ...
            // ]

            _.each(data, (row) => {
                let domain = Domains.findOne({_id: row.sn});
                if (domain) {
                    returnErrors.push({
                        sn: row.sn,
                        error: 'ALREADY_EXISTS'
                    });
                } else if (action === 'INSERT') {
                    ScesDomains.create('transceiver', user, row.sn, [ASSEMBLY_LOCATION_ID], {
                        pnum: row.pnum,
                        PartNumber: row.pnum,
                        TOSA: row.TOSA,
                        ROSA: row.ROSA,
                        PCBA: row.PCBA,
                        state: 'AddedToLocation',
                        SerialNumber: row.sn,
                        cm: row.cm,
                        cmSerialNumber: row.sncm,
                        cmShipDate: row.shipDate
                    }, [row.TOSA, row.ROSA, row.PCBA, row.sncm]);
                    ScesDomains.addEvent(ASSEMBLY_LOCATION_ID, 'add',
                        'Transceiver ' + row.sn + ' added to location.', row.sn);
                }
            });
            return returnErrors.length > 0 ? returnErrors : 'OK';
        }
    },

    '/postTestdata': {
        auth: SarHelper.myAuth,
        post: function (postData) {
            function parse (obj) {
                obj.timestamp = moment(obj.timestamp).toDate();
                obj.meta.StartDateTime = moment( obj.meta.StartDateTime).toDate();
                obj.meta.EndDateTime = moment( obj.meta.EndtDateTime).toDate();
            }

            let data = JSON.parse(postData);
            if (!Array.isArray(data)) {
                data = [data];
            }
            _.each(data, (obj) => {
                parse(obj);
            });
            _.each(data, (obj) => {
                Testdata.upsert({_id: obj._id}, obj);
            });
            return 'OK';
        }
    },

    '/postTestlog': {
        auth: SarHelper.myAuth,
        post: function (postData) {
            function parse (obj) {
                obj.timestamp = moment(obj.timestamp).toDate();
                obj.StartDateTime = moment( obj.StartDateTime).toDate();
                obj.EndDateTime = moment( obj.EndtDateTime).toDate();
            }

            let data = JSON.parse(postData);
            if (!Array.isArray(data)) {
                data = [data];
            }
            _.each(data, (obj) => {
                parse(obj);
            });
            _.each(data, (obj) => {
                Testlog.upsert({_id: obj._id}, obj);
            });
            return 'OK';
        }
    }

});
