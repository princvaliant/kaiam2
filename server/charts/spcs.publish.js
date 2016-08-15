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

Meteor.publish('testdataspcs', function (testType, testSubType, rack, searchSerials, device) {
    ScesDomains.getUser(this.userId);
    let subscription = this;
    let cursor;
    let observeHandle;

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
            query['device.PartNumber'] =  'XQX4000_Control';
        }
    }
    if (rack !== '') {
        query['meta.Rack'] = rack;
    }
    fields['device.PartNumber'] = 1;
    fields['meta.Rack'] = 1;
    fields['meta.DUT'] = 1;

    cursor = Testdata.find(
        query, {
            fields: fields,
            sort: {
                'timestamp': 1,
                'meta.DUT': 1,
                'meta.Channel': 1,
                'meta.SetTemperature_C': 1
            }
        });
    observeHandle = cursor.observe({
        added: function (doc) {
            subscription.added('c_testdataspcs', doc._id, doc);
        },
        changed: function (doc) {
            subscription.changed('c_testdataspcs', doc._id, doc);
        },
        removed: function (doc) {
            subscription.removed('c_testdataspcs', doc._id);
        }
    });
    subscription.ready();

    subscription.onStop(() => {
        observeHandle.stop();
    });
});
