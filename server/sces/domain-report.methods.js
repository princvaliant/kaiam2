'use strict';
// import {check} from 'meteor/check';


Meteor.methods({
    mesChartsNonmovingInventory: function (device, partNumber) {
        ScesDomains.isLoggedIn(this.userId);
        let match = {
            'state.id': 'AddedToLocation',
            'type': 'transceiver'
        };
        if (device !== '-all-') {
            match['dc.PartNumber'] = {
                $in: Settings.getPartNumbersForDevice(device)
            };
        }
        if (partNumber !== '-all-') {
            match['dc.PartNumber'] = partNumber;
        }
        return Domains.aggregate([{
            $match: match
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
            $match: {
                'location.dc.hide': {
                    $ne: true
                }
            }
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

    mesChartsWip: function (device, partNumber) {
        ScesDomains.isLoggedIn(this.userId);
        let match = {
            'state.id': 'AddedToLocation',
            'type': 'transceiver'
        };
        if (device !== '-all-') {
            match['dc.PartNumber'] = {
                $in: Settings.getPartNumbersForDevice(device)
            };
        }
        if (partNumber !== '-all-') {
            match['dc.PartNumber'] = partNumber;
        }
        return Domains.aggregate([{
            $match: match
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
            $match: {
                'location.dc.hide': {
                    $ne: true
                }
            }
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

    mesChartsThruput: function (device, partNumber) {
        ScesDomains.isLoggedIn(this.userId);
        let offset = Math.abs(moment().utcOffset() * 60000);
        let match = {
            'type': 'transceiver'
        };
        if (device !== '-all-') {
            match['dc.PartNumber'] = {
                $in: Settings.getPartNumbersForDevice(device)
            };
        }
        if (partNumber !== '-all-') {
            match['dc.PartNumber'] = partNumber;
        }
        return Domains.aggregate([{
            $match: match
        }, {
            $unwind: '$audit'
        }, {
            $match: {
                'audit.id': 'AddedToLocation',
                'audit.when': {
                    '$gt': new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30))
                }
            }
        }, {
            $lookup: {
                from: 'domains',
                localField: 'audit.parentId',
                foreignField: '_id',
                as: 'location'
            }
        }, {
            $unwind: {
                'path': '$location',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            $match: {
                'location.dc.hide': {
                    $ne: true
                }
            }
        }, {
            $project: {
                serial: '$_id',
                location: {$ifNull: ['$location.dc.name', '']},
                pnum: {$ifNull: ['$dc.pnum', '']},
                day: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: {
                            $subtract: ['$audit.when', offset]
                        }
                    }
                },
                week: {
                    $dateToString: {
                        format: '%Y%U',
                        date: {
                            $subtract: ['$audit.when', offset]
                        }
                    }
                }
            }
        }, {
            $sort: {
                'day': 1
            }
        }]);
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
                location: {$ifNull: ['$location.dc.name', '']},
                partNumber: {$ifNull: ['$dc.PartNumber', '']},
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
