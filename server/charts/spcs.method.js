'use strict';
/**
 * SPCs method functions
 * @type {Meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */


Meteor.methods({
    testdataspcs: function (testType, testSubType, rack, searchSerials, device) {
        ScesDomains.getUser(this.userId);

        // Construct field collection to be returned
        let _testSubType = testSubType || '';
        let fields = {};
        fields['device.SerialNumber'] = 1;
        fields['meta.SetTemperature_C'] = 1;
        fields['meta.Channel'] = 1;
        fields.timestamp = 1;
        fields.type = 1;
        fields.subtype = 1;
        let ttd = Settings.getTestConfigVariablesForPartNumber('', testType, testSubType, device);
        _.each(_.pluck(ttd, 'v'), (field) => {
            if (field !== 'RawData') {
                fields['data.' + field] = 1;
            }
        });

        // Construct query for retrieval
        let query = {};
        query.type = testType;
        query.subtype = _testSubType;
        query.timestamp = {
            '$gt': new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30))
        };
        if (searchSerials && searchSerials.length > 0) {
            query['device.SerialNumber'] = {
                '$in': searchSerials
            };
        } else {
            if (device === '40GB') {
                query['device.PartNumber'] = new RegExp('^LR4', 'i');
            }
            if (device === '100GB' && testType !== 'calibration') {
                query['device.PartNumber'] = 'XQX4000_Control';
            }
        }
        if (rack !== '-all-') {
            query['meta.Rack'] = rack;
        }
        fields['device.PartNumber'] = 1;
        fields['meta.Rack'] = 1;
        fields['meta.DUT'] = 1;

        return Testdata.find(
            query, {
                fields: fields,
                sort: {
                    'timestamp': 1,
                    'meta.DUT': 1,
                    'meta.Channel': 1,
                    'meta.SetTemperature_C': 1
                }
            }).fetch();
    }
});