'use strict';
/**
 * Packout publish functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.publish('packout', function () {
    ScesDomains.getUser(this.userId);
    return Packouts.find({});
});

Meteor.publish('packoutexports', function (query) {
    ScesDomains.getUser(this.userId);
    return PackoutsExports.find(query);
});

