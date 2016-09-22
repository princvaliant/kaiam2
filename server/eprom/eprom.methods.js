
'use strict';
/**
 * TestSpeed method functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

Meteor.methods({
    getLastPackout: function (serial) {
        ScesDomains.getUser(this.userId);
        return Testdata.findOne({
            'device.SerialNumber': serial.toUpperCase(),
            'type': 'packout'
        }, {
            sort: {
                timestamp: -1
            }
        });
    }
});
