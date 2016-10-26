'use strict';
/**
 * Timetrends publish function
 * @type {meteor.publish}
 * @param {[string]} [interval] [d, w, h1, h8]
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */
Meteor.methods({
    getTrends: function (testType, testSubType, param, serial, pnum, manuf, interval, idx) {
        ScesDomains.getUser(this.userId);
        // console.log(interval + ' ' + testType + ' ' + testSubType + ' ' + param + ' ' + serial + ' ' + pnum + ' ' + manuf);
        let df = moment().subtract(interval - 1000, 'days').startOf('day').toDate();
        let dt = moment().subtract(interval - 1001, 'days').startOf('day').toDate();
        let wf = moment().subtract(interval, 'weeks').startOf('week').toDate();
        let wt = moment().subtract(interval, 'weeks').endOf('week').toDate();

        let match = {
            $and: [
                {'_id.tt': testType},
                {'_id.st': testSubType},
                {'_id.p': param}
            ]
        };

        if (interval > 999 && interval <= 1002) {
            match.$and.push({
                'value.d': {
                    '$gte': df,
                    '$lte': dt
                }
            });
        } else if (interval <= 10) {
            match.$and.push({
                'value.d': {
                    '$gte': wf,
                    '$lte': wt
                }
            });
        } else if (interval > 1002) {
            match.$and.push({
                'value.d': {
                    $gte: df
                }
            });
        }

        if (idx) {
            match.$and.push({'value.i': idx});
        }

        // match.$and.push({ 'value.srch': 'ALL' });
        if (serial) {
            match.$and.push({'value.srch': serial});
        }
        if (pnum !== '-all-') {
            match.$and.push({'value.srch': pnum});
        }
        if (manuf !== '-all-') {
            match.$and.push({'value.srch': manuf});
        }

        let fields = {
            '_id.s': 1,
            '_id.c': 1,
            '_id.t': 1,
            'value.n': 1,
            'value.d': 1
        };

        //console.log(JSON.stringify(match));
        let res = [];
        let direct = new DirectCollection('trends');
        direct.findEach(match, {fields: fields, sort: {'_id.t': 1, '_id.c': 1, 'value.d': 1}}, function (trend) {
            res.push({
                s: trend._id.s,
                c: trend._id.c || '4',
                t: trend._id.t === null ? '_' : trend._id.t,
                n: trend.value.n,
                d: trend.value.d
            });
        });
        return res;
    }
});
