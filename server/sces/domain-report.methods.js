'use strict';
// import {check} from 'meteor/check';


Meteor.methods({
    mesChartsCurrent: function () {
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
                }
            }
        }, {
            $project: {
                label: '$_id',
                y: '$cnt',
            }
        }, {
            $sort: {
                'label': 1
            }
        }
        ]);
    },

    mesChartsWip: function () {
        ScesDomains.isLoggedIn(this.userId);
    }

})
;
