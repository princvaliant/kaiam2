'use strict';

Meteor.publish('domains', function (options, search, domain) {
    ScesDomains.isLoggedIn(this.userId);
    console.log(domain);
    let query = ScesSettings.constructQuery(Meteor.users.findOne(this.userId), search, domain);
    let ret = Domains.find(
        query,
        options);
    return ret;
});

Meteor.publish('domainById', function (domainId) {
    ScesDomains.isLoggedIn(this.userId);
    return Domains.find({
        _id: domainId
    });
});

Meteor.publish('domainKids', function (domainType, domainId, options, isCurrent) {
    ScesDomains.isLoggedIn(this.userId);
    let q = isCurrent ? {
        'state.parentId': domainId
    } : {
        parents: domainId
    };
    if (_.isArray(domainType)) {
        q.type = {'$in': domainType};
    } else if (domainType) {
        q.type = domainType;
    }
    let o = options || {};
    return Domains.find(q, o);
});

Meteor.publish('domainParents', function (domainId) {
    ScesDomains.isLoggedIn(this.userId);
    let domain = ScesDomains.getDomain(domainId);
    return Domains.find({
        _id: {
            $in: domain.parents
        }
    });
});

Meteor.publish('domainEvents', function (domainId) {
    ScesDomains.isLoggedIn(this.userId);
    return DomainEvents.find({
        domainId: domainId
    });
});

Meteor.publish('domainFiles', function (domainId) {
    ScesDomains.isLoggedIn(this.userId);
    return DomainFiles.find({
        domainId: domainId
    }, {
        fields: {
            content: 0
        }
    });
});

// Meteor.publish('domainCounts', function () {
//     ScesDomains.isLoggedIn(this.userId);
//     return DomainCounts.find();
// });
//
// Meteor.startup(function () {
//     var countObj = {};
//     var initializing = true;
//     var handle = Domains.find({}, {fields: {type: 1}}).observeChanges({
//         added: function (idx, doc) {
//             if (!countObj[doc.type]) {
//                 countObj[doc.type] = 0;
//             }
//             countObj[doc.type] += 1;
//             if (!initializing) {
//                 DomainCounts.update({_id: doc.type}, {$inc : {count: 1}})
//             }
//         },
//         removed: function (idx, doc) {
//             if (!countObj[doc.type]) {
//                 countObj[doc.type] = 0;
//             }
//             countObj[doc.type] -= 1;
//             DomainCounts.update({_id: doc.type}, {$inc : {count: -1}})
//         }
//     });
//     initializing = false;
//     for (let o in countObj) {
//         DomainCounts.upsert({_id: o}, {count: countObj[o]});
//     }
// });

