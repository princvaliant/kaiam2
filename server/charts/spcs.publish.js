'use strict';
/**
 * SPCs publish functions
 * @type {Meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.publish('testdataexclude', function () {
    ScesDomains.getUser(this.userId);
    return TestdataExclude.find();
});

Meteor.publish('spclimits', function () {
    ScesDomains.getUser(this.userId);
    return Spclimits.find();
});
