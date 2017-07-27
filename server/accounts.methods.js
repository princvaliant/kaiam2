'use strict';

Meteor.startup(function () {

    /**
     * Account Methods
     * @type {meteor.methods}
     */
    Meteor.methods({
        validateEmailAddress: function (address) {
            check(address, String);
            return new Promise(function (resolve, reject) {
                HTTP.call('GET', 'https://api.kickbox.io/v1/verify', {
                    params: {
                        email: address,
                        apikey: Settings.kickboxKey
                    }
                }, function (error, response) {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.data.result === 'invalid' || response.data.result === 'unknown') {
                            reject({
                                error: 'Sorry, your email was returned as invalid. Please try another address.'
                            });
                        } else {
                            resolve(response);
                        }
                    }
                });
            });
        },
        updateUser: function (entity, roles) {
            ScesDomains.getUser(this.userId);
            Meteor.users.update({
                _id: entity._id
            }, {
                $set: {
                    username: entity.username,
                    'profile.company': entity.profile.company,
                    'profile.isClient': entity.profile.isClient,
                    'profile.roles': _.filter(roles, function (num) {
                        return num !== null;
                    })
                }
            });
        }
    });
});
