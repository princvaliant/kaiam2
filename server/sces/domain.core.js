import {check} from 'meteor/check';

ScesDomains = {

    // Create domain object
    create: function (type, uid, id, parents, dc, tags, idLength) {
        let pi = {};
        pi._id = id || Meteor.hashid().toUpperCase();
        if (idLength) {
            pi._id = pi._id.substring(0, idLength);
        }
        pi.type = type;
        let domainDef = this.getDomainDef(type);
        let user = this.isLoggedIn(uid);
        // Check if this user role can move this process instance
        if (_.intersection(user.profile.roles, domainDef._start.roles).length === 0) {
            throw new Meteor.Error('USER_CAN_NOT_CREATE');
        }
        // Get first state in domain
        let state = domainDef._start.next[0];
        pi.state = {
            id: (dc && dc.state) ? dc.state : state,
            movedBy: user.username,
            when: moment().toDate(),
            prev: '_start',
            next: '',
            parentId: parents ? parents[0] : ''
        };
        pi.dc = dc;
        pi.tags = tags || [];
        pi.parents = parents || [];
        pi.audit = [pi.state];
        let iid = Domains.upsert({
            _id: pi._id
        }, pi);
        return iid.insertedId;
    },
    // Move domain object to next state
    move: function (uid, id, parentsAdd, parentsRemove, dc, tags, state) {
        // Check if this domain is valid
        let domain = this.getDomain(id);
        if (!domain) {
            throw new Meteor.Error('INVALID-ITEM');
        }
        let domainDef = this.getDomainDef(domain.type);
        let user = this.isLoggedIn(uid);
        // Check if this user role can move this process instance
        if (_.intersection(user.profile.roles, domainDef[domain.state.id].roles.m).length === 0) {
            throw new Meteor.Error('USER_CAN_NOT_MOVE');
        }
        // Add to audit for history track
        // if (state && !_.contains(domainDef[domain.state.id].next, state)) {
        //   throw new Meteor.Error('INVALID_STATE');
        // }
        let nextState = state || domainDef[domain.state.id].next[0];
        domain.state.end = moment().toDate();
        domain.state.next = nextState;
        domain.audit[domain.audit.length - 1] = domain.state;
        // Initialize next step
        domain.state = {
            id: nextState,
            movedBy: user.username,
            when: moment().toDate(),
            prev: domain.state.id,
            next: '',
            parentId: parentsAdd ? parentsAdd[0] : ''
        };
        if (dc) {
            domain.dc = _.extend(domain.dc || {}, dc);
        }
        if (tags) {
            domain.tags = _.union(domain.tags, tags);
        }
        domain.parents = _.union(domain.parents, parentsAdd || []);
        domain.parents = _.difference(domain.parents, parentsRemove || []);
        domain.audit.push(domain.state);
        Domains.update({
            _id: domain._id
        }, domain);
        return domain;
    },

    // Retrieve user based on user id or user name
    getUser: function (uid) {
        let user = Meteor.users.findOne({
            $or: [{
                _id: uid
            }, {
                username: uid
            }]
        });
        if (!user) {
            throw new Meteor.Error('USER-NOT-LOGGED');
        }
        if (user.profile && user.profile.roles && user.profile.roles.length === 0) {
            throw new Meteor.Error('ACCESS-NOT-ALLOWED');
        }
        if (user.profile && user.profile.isClient) {
            throw new Meteor.Error('User has no rights to access this area');
        }
        return user;
    },

    // Just check if user is logged in
    isLoggedIn: function (uid) {
        let user = Meteor.users.findOne({
            $or: [{
                _id: uid
            }, {
                username: uid
            }]
        });
        if (!user) {
            throw new Meteor.Error('USER-NOT-LOGGED');
        }
        if (user.profile && user.profile.roles && user.profile.roles.length === 0) {
            throw new Meteor.Error('ACCESS-NOT-ALLOWED');
        }
        return user;
    },

    // Get domain object based on _id
    getDomain: function (id) {
        check(id, String);
        return Domains.findOne({
            _id: id
        });
    },

    // Retrieve domain definition
    getDomainDef: function (domainType) {
        check(domainType, String);
        let domainDef = _.where(ScesSettings.domains, {
            type: domainType
        })[0];
        if (!domainDef) {
            throw new Meteor.Error('SCES.INVALID-DOMAIN-TYPE');
        }
        return domainDef;
    },

    addEvent: function (id, status, message, code) {
        DomainEvents.insert({
            _id: Meteor.hashid(),
            domainId: id,
            when: moment().toDate(),
            status: status,
            success: status === 'error' ? false : true,
            message: message,
            code: code
        });
        return message;
    }
};
