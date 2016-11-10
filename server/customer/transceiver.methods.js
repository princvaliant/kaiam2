'use strict';

Meteor.methods({
    getTransceivers: function (options, search) {
        let user = ScesDomains.isLoggedIn(this.userId);
        let query = constructQuery(user, search);
        return Domains.find(query, options).fetch();
    },

    getTransceiversTotal: function (search) {
        let user = ScesDomains.isLoggedIn(this.userId);
        let query = constructQuery(user, search);
        return Domains.find(query, {fields: {_id:1}}).count();
    }
});

function constructQuery (user, search) {
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
        query = getOnlyForCompany(user, query);
    }
    return query;
}

function getOnlyForCompany (user, query) {
    let salesOrders = Domains.find({
        type: 'salesOrder',
        'dc.Name (Sold-To)': user.profile.company
    }, {fields: {_id: 1}}).fetch();
    let ids = _.map(salesOrders, function (item) {
        return item._id;
    });
    query.$and.push({
        $or: [{parents: {$in: ids}}, {parents: user.profile.company}]
    });
    return query;
}
