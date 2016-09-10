'use strict';
/**
 * Loss publish functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */


Meteor.methods({
    losses: function (chartType, partNumber, manufacturer, interval, range, rack, rework, device, paramsFail, yieldType) {
        // Date and week range values
        ScesDomains.getUser(this.userId);
        let drange = moment().subtract(interval - 1000, 'days').format('YYYY-MM-DD');
        let wrange = moment().week() - interval - 1;
        if (wrange <= 1) {
            wrange = 53 - interval;
        }
        let match = {};
        match.rwr = rework ? 1 : 0;
        if (partNumber !== '-all-') {
            match.pnum = partNumber;
        }
        if (manufacturer !== '-all-') {
            match.cm = manufacturer;
        }
        if ((interval > 999 && interval <= 1002) || range === 'day') {
            match.d = drange;
        } else if (range === 'week') {
            match.w = wrange;
        } else if (interval > 1002) {
            match.d = {
                $gte: drange
            };
        } else {
            match.w = wrange;
        }

        // Get total passes
        let totalPasses;
        if (device === '40GB') {
            totalPasses = Yields.aggregate([{$match: match}]).length;
        }
        if (device === '100GB') {
            match.status = {$in: ['P', 'F', 'E']};
            totalPasses = TestsummaryWeek.aggregate([{$match: match}]).length;
        }

        if (rack !== 'All_racks') {
            match.rack = rack;
        }

        let unwind;
        let group = {_id: {}};
        if (paramsFail === true) {
            match.p = 0;
            group._id.tsts = '$tstparams';
        } else {
            match.f = 1;
            group._id.tsts = '$tsts';
        }
        if (chartType === 'Unique fails' || chartType === 'Fail trends') {
            if (paramsFail) {
                unwind = '$tstparams';
            } else {
                unwind = '$tsts';
            }
        }
        // Create grouping based on chart type
        if (chartType === 'Fail trends') {
            group._id.d = '$d';
        }
        group.fail = {
            $sum: '$f'
        };
        group.err = {
            $sum: '$e'
        };
        group.ids = {
            $push: '$sn'
        };
        // Aggregation pipeline
        let aggr = [{
            $match: match
        }];
        if (unwind) {
            aggr.push({$unwind: unwind});
        }
        aggr.push({$group: group});

        // Modify query and aggregation pipeline based on chart type
        if (chartType === 'Fail trends') {
            aggr.push({
                $sort: {
                    '_id.tsts': 1,
                    '_id.d': 1
                }
            });
        } else {
            aggr.push({
                $sort: {
                    'fail': -1
                }
            });
        }
        let result = [];
        if (device === '40GB') {
            result = Yields.aggregate(aggr);
        }
        if (device === '100GB') {
            if (yieldType === 'Fixed week') {
                result = TestsummaryWeek.aggregate(aggr);
            } else {
                result = Testsummary.aggregate(aggr);
            }
        }

        for (let j = 0; j < result.length; j++) {
            result[j].pass = result[j].fail / totalPasses;
        }

        return result;
    }
});
