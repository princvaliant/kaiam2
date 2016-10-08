/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collections for yields and losses',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            return Scheduler.executeAggregate(getYieldPipe());
        }
    });
});


// For testing in development
Meteor.methods({
    'aggryield': function () {
        ScesDomains.getUser(this.userId);
        Scheduler.executeAggregate(getYieldPipe());
    },
    'testyield': function () {
        ScesDomains.getUser(this.userId);
        console.log(Testdata.aggregate(getPipeline(), {allowDiskUse: true}));
    }
});

function getYieldPipe () {
    let p = JSON.stringify(getPipeline());
    p = p.replace('\"DATEFILTER\"', 'new ISODate(\"' + moment().subtract(160, 'days').toISOString() + '\")');
    return p;
}

function getPipeline () {
    return [{
        $match: Scheduler.getYieldLossMatch()
    }, {
        $project: Scheduler.getYieldProject()
    }, {
        // First sort by serial and date
        $sort: {
            sn: 1,
            sd: 1
        }
    }, {
        // Group by serial and week and add all tests for serial to list
        $group: {
            _id: {
                sn: '$sn',
                w: '$w',
                nw: '$nw'
            },
            items: {
                $push: {
                    mid: '$mid',
                    tst: '$tst',
                    d: '$d',
                    nd: '$nd',
                    m: '$m',
                    nm: '$nm',
                    pnum: '$pnum',
                    cm: '$cm',
                    rack: '$rack',
                    dut: '$dut',
                    usr: '$usr',
                    diff: '$diff',
                    r: '$r',
                    st: '$st'
                }
            },
            lastmid: {
                $last: '$mid'
            }
        }
    }, {
        // Create final document to be exported to yields collection
        $project: {
            _id: '$_id',
            items: {
                $filter: {
                    input: '$items',
                    as: 'itm',
                    cond: {
                        $eq: ['$$itm.mid', '$lastmid']
                    }
                }
            }
        }
    }, {
        // Unwind items in order to select just last measurement items
        $unwind: '$items'
    }, {
        $project: {
            sn: '$_id.sn',
            w: '$_id.w',
            nw: '$_id.nw',
            mid: '$items.mid',
            tst: '$items.tst',
            d: '$items.d',
            nd: '$items.nd',
            m: '$items.m',
            nm: '$items.nm',
            pnum: '$items.pnum',
            cm: '$items.cm',
            rack: '$items.rack',
            dut: '$items.dut',
            usr: '$items.usr',
            rwr: {
                $cond: [{
                    '$gt': ['$items.diff', 950400000]
                },
                    1,
                    0
                ]
            },
            fm: {
                $cond: [{
                    $or: [{
                        $and: [{
                            '$eq': ['$items.st', 'F']
                        }, {
                            '$eq': ['$items.r', 'ERR']
                        }]
                    }, {
                        $and: [{
                            '$eq': ['$items.st', 'E']
                        }, {
                            '$eq': ['$items.r', 'ERR']
                        }]
                    }]
                },
                    1,
                    0]
            },
            pm: {
                $cond: [{
                    '$eq': ['$items.st', 'P']
                },
                    1,
                    0]
            },
            f: {
                $cond: [{
                    '$eq': ['$items.r', 'ERR']
                },
                    1,
                    0
                ]
            },
            p: {
                $cond: [{
                    '$eq': ['$items.r', 'OK']
                },
                    1,
                    0
                ]
            },
            unk: {
                $cond: [{
                    $and: [{
                        '$ne': ['$items.st', 'P']
                    }, {
                        '$eq': ['$items.r', 'OK']
                    }]
                },
                    1,
                    0
                ]
            }
        }
    }, {
        // Group by serial and summarize fails and passes
        $group: {
            _id: {
                sn: '$sn',
                mid: '$mid'
            },
            fm: {
                $max: '$fm'
            },
            pm: {
                $max: '$pm'
            },
            f: {
                $sum: '$f'
            },
            p: {
                $sum: '$p'
            },
            unk: {
                $sum: '$unk'
            },
            tsts: {
                $push: {
                    w: '$w',
                    rwr: '$rwr',
                    nw: '$nw',
                    tst: '$tst',
                    d: '$d',
                    nd: '$nd',
                    m: '$m',
                    nm: '$nm',
                    pnum: '$pnum',
                    cm: '$cm',
                    rack: '$rack',
                    dut: '$dut',
                    usr: '$usr',
                    f: '$f',
                    p: '$p'
                }
            }
        }
    }, {
        // Unwind tests to determine unknowns
        $unwind: '$tsts'
    }, {
        // Initiate fail and pass flag and initialize list of test types with 'unknown' and 'passed'
        $project: {
            sn: '$_id.sn',
            mid: '$_id.mid',
            p: '$pm',
            f: '$fm',
            tst: {
                $cond: [{
                    '$eq': [{
                        $add: ['$f', '$p']
                    }, '$unk']
                },
                    'unknown', {
                        $cond: [{
                            '$eq': ['$tsts.f', 0]
                        },
                            'PASSEDTESTS',
                            '$tsts.tst'
                        ]
                    }
                ]
            },
            rwr: '$tsts.rwr',
            w: '$tsts.w',
            nw: '$tsts.nw',
            d: '$tsts.d',
            nd: '$tsts.nd',
            m: '$tsts.m',
            nm: '$tsts.nm',
            pnum: '$tsts.pnum',
            cm: '$tsts.cm',
            rack: '$tsts.rack',
            dut: '$tsts.dut',
            usr: '$tsts.usr'
        }
    }, {
        // Sort by serial and test type to get proper order in test list
        $sort: {
            sn: 1,
            mid: 1,
            tst: 1
        }
    }, {
        // Initialize failed test list by grouping
        $group: {
            _id: {
                sn: '$sn',
                mid: '$mid'
            },
            data: {
                $last: {
                    w: '$w',
                    nw: '$nw',
                    d: '$d',
                    nd: '$nd',
                    m: '$m',
                    nm: '$nm',
                    rwr: '$rwr',
                    pnum: '$pnum',
                    cm: '$cm',
                    rack: '$rack',
                    dut: '$dut',
                    usr: '$usr',
                    f: '$f',
                    p: '$p'
                }
            },
            tsts: {
                $addToSet: '$tst'
            }
        }
    }, {
        // Create final document to be exported to yields collection
        $project: {
            _id: '$__id',
            sn: '$_id.sn',
            w: '$data.w',
            nw: '$data.nw',
            d: '$data.d',
            nd: '$data.nd',
            m: '$data.m',
            nm: '$data.nm',
            rwr: '$data.rwr',
            pnum: '$data.pnum',
            cm: '$data.cm',
            rack: '$data.rack',
            dut: '$data.dut',
            usr: '$data.usr',
            f: '$data.f',
            p: '$data.p',
            tsts: {
                $filter: {
                    input: '$tsts',
                    as: 'tst',
                    cond: {
                        $and: [{
                            $ne: ['$$tst', 'PASSEDTESTS']
                        }, {
                            $ne: ['$$tst', 'unknown']
                        }]
                    }
                }
            }
        }
    }, {
        // Remove passed downloads from yield report
        $match: {
            $or: [{
                dut: {
                    $ne: 'Download'
                }
            }, {
                p: {
                    $ne: 1
                }
            }]
        }
    }, {
        $out: 'yields'
    }];
}

