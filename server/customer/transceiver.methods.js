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
            return item._id;
        });
    },

    getTestdataForCustomer: function (saleOrder, id) {
        let user = ScesDomains.isLoggedIn(this.userId);
        ScesDomains.isLoggedIn(this.userId);
        return Testdata.find({
            'device.SerialNumber': id
        }, {
            sort: {
                'meta.StartDateTime': -1
            }
        }).fetch();
    },

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
        ids.push(saleOrder);
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
