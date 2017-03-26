'use strict';
/**
 * TestSpeed method functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.methods({
    getTestSpeed: function (device) {
        ScesDomains.getUser(this.userId);
        let offset = Math.abs(moment().utcOffset() * 60000);
        // Aggregation pipeline
        if (device === '100GB') {
            let aggr = [{
                $match: {
                    Rack: {
                        $in: Settings.spcRacks100GB
                    },
                    timestamp: {
                        $gt: moment().subtract(90, 'days').toDate()
                    },
                    ScriptName: {$regex: 'Full'}
                }
            }, {
                $project: {
                    date: {
                        $subtract: [
                            {$subtract: ['$timestamp', offset]},
                            {
                                '$add': [
                                    {$millisecond: {$subtract: ['$timestamp', offset]}},
                                    {$multiply: [{$second: {$subtract: ['$timestamp', offset]}}, 1000]},
                                    {$multiply: [{$minute: {$subtract: ['$timestamp', offset]}}, 60, 1000]},
                                    {$multiply: [{$hour: {$subtract: ['$timestamp', offset]}}, 60, 60, 1000]}
                                ]
                            }]
                    },
                    rack: '$Rack',
                    mid: '$mid',
                    tst: {
                        $concat: ['$type', ' - ', '$subtype']
                    },
                    duration: {
                        '$divide': [
                            '$DurationSec',
                            60
                        ]
                    }
                }
            }, {
                $group: {
                    _id: {
                        mid: '$mid',
                        tst: '$tst',
                        date: '$date',
                        rack: '$rack'
                    },
                    duration: {
                        $sum: '$duration'
                    }
                }
            }, {
                $group: {
                    _id: {
                        tst: '$_id.tst',
                        date: '$_id.date',
                        rack: '$_id.rack'
                    },
                    duration: {
                        $avg: '$duration'
                    },
                    rack: {
                        $last: '$rack'
                    }
                }
            }, {
                $group: {
                    _id: {
                        date: '$_id.date',
                        rack: '$_id.rack'
                    },
                    duration: {
                        $sum: '$duration'
                    }
                }
            }, {
                $sort: {
                    '_id.date': 1
                }
            }, {
                $group: {
                    _id: '$_id.rack',
                    points: {
                        $push: {
                            x: '$_id.date',
                            y: '$duration'
                        }
                    }
                }
            }, {
                $sort: {
                    '_id': 1
                }
            }];
            return Testlog.aggregate(aggr);
        } else {
            let aggr = [{
                $match: {
                    Rack: {
                        $in: Settings.spcRacks40GB
                    }
                }
            }, {
                $project: {
                    date: '$Day',
                    rack: '$Rack',
                    duration: {
                        '$divide': [
                            '$Time',
                            60
                        ]
                    }
                }
            }, {
                $group: {
                    _id: {
                        date: '$date',
                        rack: '$rack'
                    },
                    duration: {
                        $avg: '$duration'
                    }
                }
            }, {
                $sort: {
                    '_id.date': 1
                }
            }, {
                $group: {
                    _id: '$_id.rack',
                    points: {
                        $push: {
                            x: '$_id.date',
                            y: '$duration'
                        }
                    }
                }
            }, {
                $sort: {
                    '_id': 1
                }
            }];
            return TestSpeedV.aggregate(aggr);
        }
    },

    getTestSpeedByRack: function (device, rack) {
        ScesDomains.getUser(this.userId);
        let offset = Math.abs(moment().utcOffset() * 60000);
        // Aggregation pipeline
        let aggr = [{
                $match: {
                    Rack: rack,
                    timestamp: {
                        $gt: moment().subtract(90, 'days').toDate()
                    },
                    ScriptName: {$regex: 'Full'}
                }
            }, {
                $project: {
                    date: {
                        $subtract: [
                            {$subtract: ['$timestamp', offset]},
                            {
                                '$add': [
                                    {$millisecond: {$subtract: ['$timestamp', offset]}},
                                    {$multiply: [{$second: {$subtract: ['$timestamp', offset]}}, 1000]},
                                    {$multiply: [{$minute: {$subtract: ['$timestamp', offset]}}, 60, 1000]},
                                    {$multiply: [{$hour: {$subtract: ['$timestamp', offset]}}, 60, 60, 1000]}
                                ]
                            }]
                    },
                    mid: '$mid',
                    tst: {
                        $concat: ['$type', ' - ', '$subtype']
                    },
                    duration: {
                        '$divide': [
                            '$DurationSec',
                            60
                        ]
                    }
                }
            }, {
                $group: {
                    _id: {
                        mid: '$mid',
                        tst: '$tst',
                        date: '$date'
                    },
                    duration: {
                        $sum: '$duration'
                    }
                }
            }, {
                $group: {
                    _id: {
                        tst: '$_id.tst',
                        date: '$_id.date'
                    },
                    duration: {
                        $avg: '$duration'
                    }
                }
            }, {
                $sort: {
                    '_id.date': 1,
                    '_id.tst': 1
                }
            }, {
                $group: {
                    _id: '$_id.tst',
                    points: {
                        $push: {
                            x: '$_id.date',
                            y: '$duration'
                        }
                    }
                }
            }
            ]
            ;
        return Testlog.aggregate(aggr);
    }
});
