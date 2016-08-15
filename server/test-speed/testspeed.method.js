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
        // Aggregation pipeline
        let racks = Settings.spcRacks40GB;
        if (device === '100GB') {
            racks = Settings.spcRacks100GB;
        }
        let aggr = [{
            $match: {
                $and: [{
                    Rack: {
                        $regex: /^((?!rework).)*$/i
                    }
                }, {
                    Rack: {
                        $in: racks
                    }
                }]
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
        if (device === '100GB') {
            return TestSpeed.aggregate(aggr);
        } else {
            return TestSpeedV.aggregate(aggr);
        }
    }
});
