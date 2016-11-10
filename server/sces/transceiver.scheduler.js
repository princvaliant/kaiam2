'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Update TOSA and ROSA for 40GB',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            let syncstart = Syncstart.findOne({domain: 'transceiverSync'});
            Syncstart.update({
                domain: 'transceiverSync'
            }, {
                $set: {
                    start: new Date()
                }
            });
            return exec(syncstart.start || new Date('08/01/2016'));
        }
    });
});


// For testing in development
Meteor.methods({
    'updateOsa': function () {
        ScesDomains.getUser(this.userId);
        return exec(new Date('09/01/2016'));
    }
});


function exec (date) {
    let pipeline = [{
        $match: {
            'device.PartNumber': {
                '$in': Settings.getPartNumbersForDevice('40GB')
            },
            timestamp: {
                $gt: date
            }
        }
    }, {
        $group: {
            _id: '$device.SerialNumber',
            TOSA: {
                $max: '$device.TOSA'
            },
            ROSA: {
                $max: '$device.ROSA'
            },
            PCBA: {
                $max: '$device.PCBA'
            }
        }
    }];

    let list = Testdata.aggregate(pipeline);

    _.each(list, (row) => {
        Domains.update({_id: row._id, 'dc.TOSA': {$in: [null, '']}}, {
            $set: {
                'dc.TOSA': row.TOSA,
                'dc.ROSA': row.ROSA,
                'dc.PCBA': row.PCBA
            }
        });
    });

    return list;
}
