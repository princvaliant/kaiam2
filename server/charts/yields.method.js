'use strict';
/**
 * Yield publish functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.methods({
    yields: function (minTotal, manufacturer, interval, device, yieldType) {
        ScesDomains.getUser(this.userId);
        let match = {};
        if (interval === 'Rework') {
            match.rwr = 1;
        } else {
            match = {
                $or: [{
                    'rwr': {
                        $ne: 1
                    }
                }, {
                    f: {
                        $ne: 1
                    }
                }]
            };
            if (interval === 'Daily') {
                match.d = {
                    $gt: moment().subtract(90, 'days').format('YYYY-MM-DD')
                };
            }
            if (interval === 'Weekly') {
                match.d = {
                    $gt: moment().subtract(190, 'days').format('YYYY-MM-DD')
                };
            }
        }
        if (manufacturer !== '-all-') {
            match.cm = manufacturer;
        }
        let group = {
            _id: {}
        };
        let sort = {};
        group._id.pnum = '$pnum';
        if (interval === 'Weekly') {
            group._id.w = '$w';
            group._id.nw = '$nw';
            sort['_id.nw'] = 1;
        } else if (interval === 'Monthly') {
            group._id.m = '$m';
            group._id.nm = '$nm';
            sort['_id.nm'] = 1;
        } else {
            group._id.d = '$d';
            group._id.nd = '$nd';
            sort['_id.nd'] = 1;
        }
        group.fail = {
            $sum: '$f'
        };
        group.pass = {
            $sum: '$p'
        };
        group.err = {
            $sum: '$e'
        };

        let aggr = [{
            $match: match
        }, {
            $group: group
        }, {
            $sort: sort
        }];

        // console.log(JSON.stringify(aggr));

        let result = [];
        if (device === '40GB') {
            result = Yields.aggregate(aggr);
        }
        if (device === '100GB') {
            match.pnum = {$nin: ['XQXGRR4000', 'XQXENG4000', 'XQXENG4100']};
            if (yieldType === 'Fixed week') {
                result = TestsummaryWeek.aggregate(aggr);
            } else {
                result = Testsummary.aggregate(aggr);
            }
        }

        let min = parseInt(minTotal);
        if (min > 0) {
            result = _.filter(result, function (rec) {
                return rec.pass + rec.fail > min;
            });
        }
        if (device === '100GB') {
            let grp = _.groupBy(result, (c) => {
                return 'd' + c._id.d + 'nd' + c._id.nd + 'w' + c._id.w + 'nw' + c._id.nw + 'm' + c._id.m + 'nm' + c._id.nm;
            });
            _.each(grp, (val, key) => {
                let id = _.clone(val[0]._id);
                id.pnum = '-all-';
                let obj = {err: 0, pass: 0, fail: 0, _id: id};
                _.each(val, (vo) => {
                    obj.err += vo.err;
                    obj.fail += vo.fail;
                    obj.pass += vo.pass;
                });
                result.push(obj);
            });
            result = _.sortBy(result, (srt) => {
                return srt._id.nw ? srt._id.nw : (srt._id.nd ? srt._id.nd : srt._id.nm );
            });
        }

        return result;
    }
});
