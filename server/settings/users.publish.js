'use strict';

/**
 * Publish Current User
 * Defaults: 'username', 'email', 'profile'
 * Adding ?
 * @type {Meteor.publish}
 */
Meteor.publish('userData', function () {
    // user is logged in
    if (!this.userId) {
        this.ready();
    } else {
        ScesDomains.getUser(this.userId);
        return Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                'services.twitter': 1,
                'services.facebook': 1,
                'services.google': 1
            }
        });
    }
});
/**
 * Publish Users
 * email | profile
 * @type {Meteor.publish}
 */
Meteor.publish('users', function () {
    if (!this.userId) {
        this.ready();
    } else {
        ScesDomains.getUser(this.userId);
        return Meteor.users.find({}, {
            fields: {
                username: 1,
                createdAt: 1,
                emails: 1,
                profile: 1
            }
        });
    }
});

Meteor.methods({
    getUser: function () {
        if (this.userId) {
            return Meteor.users.findOne({_id: this.userId}, {
                fields: {
                    username: 1,
                    emails: 1,
                    profile: 1
                }
            });
        }
    }
});


