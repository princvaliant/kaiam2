

HTTP.methods({
    '/getRevisionFile': {
        auth: SarHelper.myAuth,
        get: function (data) {
            let query = SarHelper.getQuery(this.query);
            if (typeof query === 'string') {
                return query;
            }
            let ret = Sar.findOne(query, {sort: {rev: -1}});
            if (ret) {
                return ret.fileContent;
            } else {
                return 'ERROR: Not found';
            }
        }
    },
    '/getRevisionActions': {
        auth: SarHelper.myAuth,
        get: function (data) {
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
        get: function (data) {
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
        get: function (data) {
            let regsnum = new RegExp(this.query.sn, 'i');
            return Testdata.findOne(
                {
                    'device.SerialNumber': {
                        $regex: regsnum
                    },
                    type: 'txtests',
                    subtype: 'channeldata'
                }, {
                    sort: {
                        'meta.StartDateTime': -1
                    }
                }) || 'TEST NOT COMPLETE ALL FAILED';
        }
    }
});
