'use strict';


/**
 * Account Methods
 * @type {meteor.methods}
 */
Meteor.methods({
    exportData: function (serial, testType, partNumber, dateFrom, dateTo, errorStatus) {
        // Construct field collection to be returned
        ScesDomains.getUser(this.userId);
        let query = {$and: []};

        if (_.isArray(serial)) {
            query.$and.push({
                'device.SerialNumber': {
                    '$in': serial
                }
            });
        } else if (serial) {
            query.$and.push({
                'device.SerialNumber': {
                    '$in': serial.split(/[\s,]+/)
                }
            });
        } else {
            if (partNumber) {
                query.$and.push({'device.PartNumber': partNumber});
            }
            if (dateFrom !== null && dateTo !== null) {
                query.$and.push({
                    'timestamp': {
                        '$gte': dateFrom,
                        '$lte': moment(dateTo).endOf('day').toDate()
                    }
                });
            }
        }
        if (_.isArray(testType) && testType[0] !== 'ALL - ALL') {
            _.each(testType, (o) => {
                if (o) {
                    let tt = o.split(' - ');
                    let st = '';
                    if (tt[0] !== tt[1]) {
                        st = tt[1];
                        st = st.split('|')[0];
                        query.$and.push({type: tt[0], subtype: st});
                    } else {
                        query.$and.push({type: tt[0], subtype: tt[1]});
                    }
                }
            });
        } else {
            let orcmd = {'$or': []};
            query.$and.push();
            _.each(_.keys(Settings.timeTrendShortNames), (key) => {
                _.each(_.keys(Settings.timeTrendShortNames[key]).sort(), (key2) => {
                    orcmd.$or.push({type: key, subtype: key2});
                });
            });
            query.$and.push(orcmd);
        }
        if (errorStatus === 'F') {
            query.$and.push({
                'status': {
                    '$ne': 'P'
                }
            });
        }
        if (errorStatus === 'P') {
            query.$and.push({
                'status': {
                    '$eq': 'P'
                }
            });
        }

        let testdata = Testdata.aggregate([{
            $match: query
        }, {
            $project: {
                data: '$data',
                date: '$meta.StartDateTime',
                mid: '$mid',
                snum: '$device.SerialNumber',
                test: '$type',
                subtest: '$subtype',
                ares: '$status',
                mres: '$measstatus',
                tres: '$result',
                manuf: {$concat: ['', '$device.ContractManufacturer']},
                pnum: '$device.PartNumber',
                t: '$meta.SetTemperature_C',
                v: '$meta.SetVoltage',
                c: '$meta.Channel',
                d: '$meta.DUT',
                r: '$meta.Rack',
                swver: {$concat: ['', '$meta.SwVer']},
                fails: '$failCodes',
                failsrt: '$TestFail'
            }
        }, {
            $sort: {
                snum: 1,
                test: 1,
                subtest: 1
            }
        }, {
            $limit: 12000
        }], {allowDiskUse: true});

        return testdata;
    }
});



