'use strict';
// import {check} from 'meteor/check';


Meteor.methods({
    mesChartsActivity: function () {
        ScesDomains.isLoggedIn(this.userId);
        return Domains.aggregate([{
            $match: {
                'state.id': 'AddedToLocation',
                'type': 'transceiver'
            }
        }, {
            $lookup: {
                from: 'domains',
                localField: 'state.parentId',
                foreignField: '_id',
                as: 'location'
            }
        }, {
            $unwind: '$location'
        }, {
            $project: {
                serial: '$_id',
                name: '$location.dc.name',
                duration: {
                    $divide: [{
                        $subtract: [new Date(), '$state.when']
                    }, 1000]
                }
            }
        }, {
            $group: {
                _id: '$name',
                list: {
                    $push: {
                        serial: '$serial',
                        duration: '$duration'
                    }
                }
            }
        }, {
            $sort: {
                '_id': 1
            }
        }
        ]);
    },

    mesChartsWip: function () {
        ScesDomains.isLoggedIn(this.userId);
        return Domains.aggregate([{
            $match: {
                'state.id': 'AddedToLocation',
                'type': 'transceiver'
            }
        }, {
            $lookup: {
                from: 'domains',
                localField: 'state.parentId',
                foreignField: '_id',
                as: 'location'
            }
        }, {
            $unwind: '$location'
        }, {
            $group: {
                _id: '$location.dc.name',
                ord: {
                    $sum: 1
                },
                cnt: {
                    $sum: 1
                },
                serials: {
                    $push: '$_id'
                }
            }
        }, {
            $project: {
                label: '$_id',
                y: '$cnt',
                serials: '$serials'
            }
        }, {
            $sort: {
                'label': 1
            }
        }
        ]);
    },

    mesExportData: function (serials) {
        ScesDomains.isLoggedIn(this.userId);
        return Domains.aggregate([{
            $match: {
                '_id': {
                    $in: serials
                }
            }
        }, {
            $lookup: {
                from: 'domains',
                localField: 'state.parentId',
                foreignField: '_id',
                as: 'location'
            }
        }, {
            $unwind: '$location'
        }, {
            $project: {
                serial: '$_id',
                location: '$location.dc.name',
                type: '$type',
                movedBy: '$state.movedBy',
                when: '$state.when'
            }
        }, {
            $sort: {
                'serial': 1
            }
        }
        ]);
    }
});
