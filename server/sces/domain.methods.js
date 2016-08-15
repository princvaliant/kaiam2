'use strict';

Meteor.methods({

    createDomain: function (type, id, parents, dc, tags, idLength) {
        check(type, String);
        ScesDomains.isLoggedIn(this.userId);
        return ScesDomains.create(type, this.userId, id, parents, dc, tags, idLength);
    },

    getDomain: function (id) {
        check(id, String);
        ScesDomains.isLoggedIn(this.userId);
        return Domains.findOne({
            _id: id
        });
    },

    getDomainsCount: function (search, filter) {
        ScesDomains.isLoggedIn(this.userId);
        return Domains.find(
            ScesDomains.constructQuery(this.userId, search, filter)).count();
    },

    getDomainKidsCount: function (domainType, domainId, notDomainId) {
        ScesDomains.isLoggedIn(this.userId);
        let q = {
            $and: [{
                parents: domainId
            }, {
                parents: {
                    $ne: notDomainId
                }
            }]
        };
        if (domainType) {
            q.$and.push({
                type: domainType
            });
        }
        return Domains.find(q, {
            _id: 1
        }).count();
    },

    saveDomainFile: function (domainId, content, contentLength, fileName) {
        DomainFiles.upsert({
            domainId: domainId,
            fileName: fileName
        }, {
            _id: Meteor.hashid(),
            fileName: fileName,
            domainId: domainId,
            content: content,
            length: contentLength,
            when: moment().toDate()
        });
    },

    getDomainFile: function (domainId) {
        return DomainFiles.findOne(domainId);
    }
});
