'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function() {
  SyncedCron.add({
    name: 'Prepare collections for powercalbeforetx page',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text('every 14 hours');
    },
    job: function() {
      return Scheduler.executeAggregate(getPipeline());
    }
  });
});

// For testing in development
Meteor.methods({
  'formatpowercal': function() {
    ScesDomains.getUser(this.userId);
    Scheduler.executeAggregate(getPipeline());
  }
});

function getPipeline() {
  let offset = Math.abs(moment().utcOffset() * 60000);
  let pipeline = [{
    $match: {
      $and: [{
        'type': 'powercalbeforetx'
      }, {
        'subtype': 'beforetx'
      }, {
        'status': 'P'
      }, {
        'timestamp': {
          $gt: 'DATEFILTER'
        }
      }, {
        'meta.Rack': {
          '$in': Settings.racks
        }
      }, {
        'data.DCAAvgPwrCal': {
          $gte: 0,
          $lte: 7
        }
      }]
    }
  }, {
    $project: {
      __id: '$_id',
      t: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: {
            $subtract: ['$meta.StartDateTime', offset]
          }
        }
      },
      r: '$meta.Rack',
      d: '$meta.DUT',
      c: '$meta.Channel',
      v: '$data.DCAAvgPwrCal'
    }
  }, {
    $group: {
      _id: {
        t: '$t',
        r: '$r',
        d: '$d',
        c: '$c'
      },
      v: {
        $push: '$v'
      }
    }
  }, {
    $project: {
      _id: '$__id',
      id: '$_id',
      v: '$v'
    }
  }, {
    $out: 'powercalbeforetx'
  }];

  let p = JSON.stringify(pipeline);

  p = p.replace('\"DATEFILTER\"', 'new ISODate(\"' + moment().subtract(90, 'days').toISOString() + '\")');

  return p;
}
