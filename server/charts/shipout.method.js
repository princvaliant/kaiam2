'use strict';
/**
 * Packout publish functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.methods({
    shipouts: function (device, company) {
        // Date and week range values
        ScesDomains.getUser(this.userId);

        let match = {
            'trays.type': 'tray',
            'trays.dc.pnum': {
                $in: Settings.getPartNumbersForDevice(device)
            }
        };
        if (company !== '-all-') {
            match['orders.dc.Name (Sold-To)'] = company;
        }

        let r = Domains.aggregate([{
            $match: {
                'type': 'shipment',
                'state.when': {
                    $gt: moment().subtract(45, 'days').toDate()
                },
                'state.id': 'Sent'
            }
        }, {
            $unwind: '$parents',
        }, {
            $lookup: {
                from: 'domains',
                localField: 'parents',
                foreignField: '_id',
                as: 'orders'
            }
        }, {
            $unwind: '$orders'
        }, {
            $lookup: {
                from: 'domains',
                localField: '_id',
                foreignField: 'parents',
                as: 'trays'
            }
        }, {
            $unwind: '$trays'
        }, {
            $match: match
        }, {
            $lookup: {
                from: 'domains',
                localField: 'trays._id',
                foreignField: 'parents',
                as: 'transceivers'
            }
        }, {
            $unwind: '$transceivers'
        }, {
            $match: {
                'transceivers.type': 'transceiver'
            }
        }, {
            $project: {
                _id: '$transceivers._id',
                ts: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$state.when'
                    }
                },
                wk: {
                    $dateToString: {
                        format: '%Y%U',
                        date: '$state.when'
                    }
                },
                nd: {
                    $dateToString: {
                        format: '%Y%j',
                        date: '$state.when'
                    }
                },
                clnt: '$orders.dc.Name (Sold-To)',
                pnum: '$trays.dc.pnum'
            }
        }, {
            $sort: {
                ts: 1
            }
        }]);
        return r;
    }
});