'use strict';

Meteor.methods({
    getTransceivers: function (options, search, saleOrder) {
        let user = ScesDomains.isLoggedIn(this.userId);
        let query = constructQuery(user, search, saleOrder);
        return Domains.find(query, options).fetch();
    },

    getTransceiversTotal: function (search, saleOrder) {
        let user = ScesDomains.isLoggedIn(this.userId);
        let query = constructQuery(user, search, saleOrder);
        return Domains.find(query, {fields: {_id: 1}}).count();
    },

    getSaleOrders: function () {
        let user = ScesDomains.isLoggedIn(this.userId);
        return _.map(saleOrdersForUser(user), function (item) {
            return item._id + ' (' + item.cnt + ')';
        });
    },

    getTestParameters: function (serials) {
        ScesDomains.isLoggedIn(this.userId);

        let td = Testdata.aggregate([{
            $match: {
                'device.SerialNumber': {
                    $in: serials
                },
                $or: [
                    {type: 'txtests', subtype: 'channeldata'},
                    {type: 'rxtests', subtype: 'sensitivity'}
                ]
            }
        }, {
            $sort: {
                'timestamp': -1
            }
        }, {
            $group: {
                _id: {
                    sn: '$device.SerialNumber',
                    t: '$type',
                    st: '$subtype'
                },
                mid: {
                    $first: '$mid'
                }
            }
        }, {
            $lookup: {
                from: 'testdata',
                localField: 'mid',
                foreignField: 'mid',
                as: 'tests'
            }
        }, {
            $unwind: '$tests'
        }, {
            $match: {
                $or: [
                    {'tests.type': 'txtests', 'tests.subtype': 'channeldata'},
                    {'tests.type': 'rxtests', 'tests.subtype': 'sensitivity'}
                ]
            }
        }, {
            $sort: {
                '_id.sn': 1,
                'tests.meta.SetTemperature_C': 1,
                'tests.meta.Channel': 1
            }
    }]);

        let map = new Map();
        _.each(td, (row) => {
            let key = row._id.sn + row.tests.meta.SetTemperature_C + row.tests.meta.Channel;
            if (!map.get(key)) {
                map.set(key, {
                    SerialNumber: row._id.sn,
                    SetTemperature_C: row.tests.meta.SetTemperature_C,
                    Channel: row.tests.meta.Channel
                });
            }
            if (row.tests.type === 'txtests' && row.tests.subtype === 'channeldata') {
                let obj = {
                    Er_in_dB: row.tests.data.Er_in_dB.toFixed(2),
                    OMA_in_dBm: row.tests.data.OMA_in_dBm.toFixed(2),
                    Pavg_in_dBm: row.tests.data.Pavg_in_dBm.toFixed(2),
                    MM_in_percent: row.tests.data.MM_in_percent || row.tests.data.CwdmMaskMargin
                };
                obj.MM_in_percent = obj.MM_in_percent.toFixed(2);
                map[key] = _.extend(map.get(key), obj);
            }
            if (row.tests.type === 'rxtests' && row.tests.subtype === 'sensitivity') {
                let obj = {
                    Sensitivity_dBm: row.tests.data.CWDM4_sens || row.tests.data.ExtrapolatedPower_dBm
                };
                obj.Sensitivity_dBm = obj.Sensitivity_dBm.toFixed(2);
                map[key] = _.extend(map.get(key), obj);
            }
        });
        return [...map.values()];
    }
});

function constructQuery (user, search, saleOrder) {
    let query = {};
    if (search) {
        let sp = search.split(' ');
        query.$and = [{type: 'transceiver'}];
        if (sp.length > 1) {
            let res = '';
            _.each(sp, (s) => {
                if (s.trim()) {
                    res = '"' + s.trim() + '" ';
                }
            });
            query.$text = {$search: res};
        } else {
            query.$text = {$search: search.trim()};
        }
    } else {
        query = ScesSettings.constructQuery(Meteor.users.findOne(user._id), '', 'transceiver');
    }
    if (user.profile.isClient === 'Y') {
        query = getOnlyForCompany(user, query, saleOrder);
    }
    return query;
}

function getOnlyForCompany (user, query, saleOrder) {
    let ids = [];
    if (saleOrder === '-all-') {
        let saleOrders = saleOrdersForUser(user);
        ids = _.map(saleOrders, function (item) {
            return item._id;
        });
    } else {
        if (saleOrder) {
            let so = saleOrder.split('(')[0].trim();
            ids.push(so);
        }
    }
    query.$and.push({
        $or: [{parents: {$in: ids}}, {parents: user.profile.company}]
    });
    return query;
}

function saleOrdersForUser (user) {
    return Domains.aggregate([{
        $match: {
            'type': 'salesOrder',
            'dc.Name (Sold-To)': user.profile.company
        }
    }, {
        $lookup: {
            from: 'domains',
            localField: '_id',
            foreignField: 'parents',
            as: 'trans'
        }
    }, {
        $unwind: '$trans'
    }, {
        $match: {
            'trans.type': 'transceiver'
        }
    }, {
        $group: {
            _id: '$_id',
            cnt: {
                $sum: 1
            }
        }
    }]);
}
