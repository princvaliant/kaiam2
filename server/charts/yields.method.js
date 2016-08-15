'use strict';
/**
 * Yield publish functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.methods({
  yields: function(minTotal, manufacturer, interval, device) {
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
    }
    if (manufacturer !== '') {
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
      result = Testsummary.aggregate(aggr);
    }

    let min = parseInt(minTotal);
    if (min > 0) {
      result = _.filter(result, function(rec) {
        return rec.pass + rec.fail > min;
      });
    }

    return result;
  }
});
