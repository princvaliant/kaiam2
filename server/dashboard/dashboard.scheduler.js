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

function getPipeline () {
    let offset = Math.abs(moment().utcOffset() * 60000);
    let pipeline = [{
        $match: {
            $and: [{
                'type': {
                    '$in': _.union(_.keys(Settings.testConfig))
                }
            }, {
                'device.PartNumber': {
                    $in: _.map(PartNumbers.find().fetch(), (p) => {return p.name;})
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
            y: {
                $year: {
                    $subtract: ['$meta.StartDateTime', offset]
                }
            },
            w: {
                $week: {
                    $subtract: ['$meta.StartDateTime', offset]
                }
            },
            d: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            }
        }
    }, {
        $sort: {
            ts: 1
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
            y: {
                $last: '$y'
            },
            d: {
                $last: '$d'
            }
        }
    }, {
        $group: {
            _id: {
                p: '$_id.p',
                t: '$_id.t',
                y: '$y',
                w: '$w'
            },
            wok: {
                $sum: {
                    $cond: [{
                        $eq: ['$s', 'P']
                    },
                        1,
                        0
                    ]
                }
            },
            wtot: {
                $sum: {
                    $cond: [{
                        $ne: ['$s', 'X']
                    },
                        1,
                        0
                    ]
                }
            },
            ds: {
                $push: {
                    s: '$s',
                    d: '$d'
                }
            }
        }
    }, {
        $unwind: '$ds'
    }, {
        $group: {
            _id: {
                p: '$_id.p',
                t: '$_id.t',
                d: '$ds.d'
            },
            wok: {
                $last: '$wok'
            },
            wtot: {
                $last: '$wtot'
            },
            w: {
                $last: '$_id.w'
            },
            dok: {
                $sum: {
                    $cond: [{
                        $eq: ['$ds.s', 'P']
                    },
                        1,
                        0
                    ]
                }
            },
            dtot: {
                $sum: {
                    $cond: [{
                        $ne: ['$ds.s', 'X']
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
            p: '$_id.p',
            t: '$_id.t',
            d: '$_id.d',
            w: '$w',
            wok: '$wok',
            wtot: '$wtot',
            dtot: '$dtot',
            dok: '$dok'
        }
    }, {
        $sort: {
            't': 1,
            'p': 1,
            'd': 1
        }
    }, {
        $out: 'dashboard'
    }];

    let p = JSON.stringify(pipeline);

    p = p.replace('\"DATEFILTER\"', 'ISODate(\"' + moment().subtract(90, 'days').toISOString() + '\")');

    return p;
}
