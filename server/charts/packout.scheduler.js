'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collections for packout page',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 52 minutes');
        },
        job: function () {
            Scheduler.executeAggregate(execPackout());
        }
    });
    SyncedCron.add({
        name: 'Prepare collections for packout export page',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 3 hours');
        },
        job: function () {
            return Scheduler.executeAggregate(execPackoutExport());
        }
    });
});


// For testing in development
Meteor.methods({
    'formatpack': function () {
        ScesDomains.getUser(this.userId);
        Scheduler.executeAggregate(execPackout());
        Scheduler.executeAggregate(execPackoutExport());
    }
});

function execPackout () {
    let offset = Math.abs(moment().utcOffset() * 60000);
    let pipeline = [{
        $match: {
            type: 'packout',
            subtype: {$in: ['', 'packout']},
            status: 'P',
            'meta.StartDateTime': {
                $gt: 'DATEFILTER'
            },
            'device.PartNumber': {
                '$nin': Settings.controlPartNumbers
            }
        }
    }, {
        $project: {
            __id: '$_id',
            mid: '$mid',
            pnum: '$device.PartNumber',
            sn: '$device.SerialNumber',
            cm: '$device.ContractManufacturer',
            ts: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            wk: {
                $dateToString: {
                    format: '%Y%U',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            n: {
                $dateToString: {
                    format: '%Y%j',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
        }
    }, {
        $sort: {
            'meta.StartDateTime': 1
        }
    }, {
        $group: {
            _id: {
                pnum: '$pnum',
                sn: '$sn'
            },
            cm: {
                $last: '$cm'
            },
            ts: {
                $last: '$ts'
            },
            n: {
                $last: '$n'
            },
            wk: {
                $last: '$wk'
            }
        }
    }, {
        $group: {
            _id: {
                pnum: '$_id.pnum',
                cm: '$cm',
                ts: '$ts',
                n: '$n',
                wk: '$wk'
            },
            cnt: {
                $sum: 1
            }
        }
    }, {
        $project: {
            _id: '$__id',
            id: '$_id',
            cnt: '$cnt'
        }
    }, {
        $sort: {
            'id.ts': 1,
            'id.pnum': 1
        }
    }, {
        $out: 'packout'
    }];

    let p = JSON.stringify(pipeline);

    p = p.replace('\"DATEFILTER\"', 'new ISODate(\"' + moment().subtract(97, 'days').toISOString() + '\")');

    return p;
}

function execPackoutExport () {
    let offset = Math.abs(moment().utcOffset() * 60000);
    let pipeline = [{
        $match: {
            type: 'packout',
            subtype: '',
            status: 'P',
            'meta.StartDateTime': {
                $gt: 'DATEFILTER'
            },
            'device.PartNumber': {
                '$nin': Settings.controlPartNumbers
            }
        }
    }, {
        $project: {
            __id: '$_id',
            mid: '$mid',
            pnum: '$device.PartNumber',
            sn: '$device.SerialNumber',
            cm: '$device.ContractManufacturer',
            ts: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            wk: {
                $dateToString: {
                    format: '%Y%U',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            n: {
                $dateToString: {
                    format: '%Y%j',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
        }
    }, {
        $sort: {
            'meta.StartDateTime': 1
        }
    }, {
        $group: {
            _id: {
                pnum: '$pnum',
                sn: '$sn'
            },
            cm: {
                $last: '$cm'
            },
            ts: {
                $last: '$ts'
            },
            n: {
                $last: '$n'
            },
            wk: {
                $last: '$wk'
            }
        }
    }, {
        $project: {
            _id: '$__id',
            id: '$_id',
            cm: '$cm',
            ts: '$ts',
            n: '$n',
            wk: '$wk'
        }
    }, {
        $sort: {
            'id.pnum': 1,
            'id.sn': 1
        }
    }, {
        $out: 'packoutexport'
    }];

    let p = JSON.stringify(pipeline);

    p = p.replace('\"DATEFILTER\"', 'new ISODate(\"' + moment().subtract(97, 'days').toISOString() + '\")');

    return p;
}

