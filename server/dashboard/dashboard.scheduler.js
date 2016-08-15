'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collections for dashboards page 2',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 30 minutes');
        },
        job: function () {
            return Scheduler.executeAggregate(getPipeline());
        }
    });
});


// For testing in development
Meteor.methods({
    'formatdash': function () {
        ScesDomains.getUser(this.userId);
        Scheduler.executeAggregate(getPipeline());
    }
});

function getPipeline() {
    let offset = Math.abs(moment().utcOffset() * 60000);
    let pipeline = [{
        $match: {
            $and: [{
                'type': {
                    '$in': _.union(_.keys(Settings.testConfig))
                }
            }, {
                'device.PartNumber': {
                    $in: _.keys(Settings.partNumbers)
                }
            }, {
                'timestamp': {
                    $gt: 'DATEFILTER'
                }
            }, {
                $or: [{
                    'meta.DUT': {
                        $ne: 'Download'
                    }
                }, {
                    status: {
                        $ne: 'P'
                    }
                }]
            }]
        }
    }, {
        $project: {
            __id: '$_id',
            mid: '$mid',
            p: '$device.PartNumber',
            sn: '$device.SerialNumber',
            s: '$status',
            t: {
                $cond: [{
                    $eq: ['$type', 'packout']
                },
                    'packout',
                    'tests'
                ]
            },
            w: {
                $week: {
                    $subtract: ['$meta.StartDateTime', offset]
                }
            },
            d: {
                $dayOfYear: {
                    $subtract: ['$meta.StartDateTime', offset]
                }
            }
        }
    }, {
        $sort: {
            d: 1
        }
    }, {
        $group: {
            _id: {
                p: '$p',
                sn: '$sn',
                t: '$t'
            },
            s: {
                $last: '$s'
            },
            w: {
                $last: '$w'
            },
            d: {
                $last: '$d'
            }
        }
    }, {
        $group: {
            _id: {
                p: '$_id.p',
                t: '$_id.t'
            },
            wok: {
                $sum: {
                    $cond: [{
                        $and: [{
                            $eq: ['$w', parseInt(moment().format('w'), 10) - 1]
                        }, {
                            $eq: ['$s', 'P']
                        }]
                    },
                        1,
                        0
                    ]
                }
            },
            wtot: {
                $sum: {
                    $cond: [{
                        $and: [{
                            $eq: ['$w', parseInt(moment().format('w'), 10) - 1]
                        }, {
                            $ne: ['$s', 'X']
                        }]
                    },
                        1,
                        0
                    ]
                }
            },
            dok: {
                $sum: {
                    $cond: [{
                        $and: [{
                            $eq: ['$d', parseInt(moment().format('DDD'), 10)]
                        }, {
                            $eq: ['$s', 'P']
                        }]
                    },
                        1,
                        0
                    ]
                }
            },
            dtot: {
                $sum: {
                    $cond: [{
                        $and: [{
                            $eq: ['$d', parseInt(moment().format('DDD'), 10)]
                        }, {
                            $ne: ['$s', 'X']
                        }]
                    },
                        1,
                        0
                    ]
                }
            }
        }
    }, {
        $project: {
            _id: '$__id',
            id: '$_id',
            wok: '$wok',
            wtot: '$wtot',
            dtot: '$dtot',
            dok: '$dok'
        }
    }, {
        $sort: {
            'id.t': 1,
            'id.p': 1
        }
    }, {
        $out: 'dashboard'
    }];

    let p = JSON.stringify(pipeline);

    p = p.replace('\"DATEFILTER\"', 'ISODate(\"' + moment().subtract(8, 'days').toISOString() + '\")');

    return p;
}
