'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Update TOSA and ROSA from TestData',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            let syncstart = Syncstart.findOne({domain: 'transceiverSync'}) || {};
            Syncstart.upsert({
                domain: 'transceiverSync'
            }, {
                $set: {
                    start: new Date()
                }
            });
            return exec(syncstart.start || new Date('07/01/2016'));
        }
    });
});


// For testing in development
Meteor.methods({
    'updateOsa': function () {
        ScesDomains.getUser(this.userId);
        return exec(new Date('07/01/2016'));
    }
});


function exec (date) {
    let mom = moment(date);
    // Increment date range weekly
    for (let m = mom; m.isBefore(moment()); m.add(7, 'days')) {
        // Find start end end of week for that range
        let sw = moment(m).startOf('week');
        let ew = moment(m).endOf('week');
        let pnums = Settings.getPartNumbersForDevice('-all-');
        let pipeline = [{
            $match: {
                'device.PartNumber': {
                    '$in': pnums
                },
                timestamp: {
                    $gte: sw.toDate(),
                    $lte: ew.toDate()
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
                },
                PartNumber: {
                    $max: '$device.PartNumber'
                }
            }
        }];

        let list = Testdata.aggregate(pipeline);
        _.each(list, (row) => {
            if (row.TOSA) {
                Domains.update({_id: row._id, 'dc.TOSA': {$in: [null, '']}}, {
                    $set: {
                        'dc.TOSA': row.TOSA,
                        'dc.ROSA': row.ROSA,
                        'dc.PCBA': row.PCBA
                    }
                });
            }
            if (row.PartNumber) {
                Domains.update({_id: row._id, 'dc.PartNumber': {$in: [null, '']}}, {
                    $set: {
                        'dc.PartNumber': row.PartNumber
                    }
                });
            }
        });
    }
    return true;
}
