/**
 * Scheduled jobs forlink test data processing
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Process linktest data',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            execLinktest();
        }
    });
});

// For testing in development
Meteor.methods({
    'linktest': function () {
        execLinktest();
    }
});

function execLinktest () {
    let row = true;
    while (row) {
        row = SyncFiles.findOne({source: 'DB1', path: '//s1/Legacy/linktestdata', processed: false}, {sort: {dateCreated: 1}});
        if (row) {
            let data = Papa.parse(row.content);
            if (data && data.data) {
                let dataDef = Settings.testConfig.link.test.common;
                for (let i = 1; i < data.data.length; i++) {
                    let obj = {data: {}, meta: {}, device: {}};
                    // Construct testdata object for row in linktest file
                    for (let o in dataDef) {
                        let val = data.data[i][o.replace('_', '.')];
                        let finalval = parseFloat(val);
                        if (_.isNaN(finalval)) {
                            if (dataDef[o] === 'counterRefreshTime') {
                                finalval = moment(val, 'ddd MMM DD HH:mm:ss YYYY').toDate();
                            } else {
                                finalval = val;
                            }
                        }
                        obj.data[dataDef[o]] = finalval;
                    }
                    obj.data.switch = parseInt(row.code);
                    let datestr = row.fileName.split('_');
                    if (datestr.length === 3) {
                        let date = moment(datestr[1] + datestr[2].substring(0, 2), 'YYYYMMDDHH');

                        obj.data.subpath = row.subpath;
                        obj.meta.Channel = parseInt(row.code);

                        // Query testdata for first value
                        let firsttest = Testdata.findOne(
                            {
                                'device.SerialNumber': obj.data.transceiverSN,
                                type: 'link',
                                subtype: 'test',
                                'data.subpath': row.subpath
                            },
                            {sort: {'meta.StartDateTime': 1}});
                        if (!firsttest) {
                            obj.data.hour = 0;
                            obj.mid = Meteor.hashid();
                        } else if (date) {
                            let duration = moment.duration(date.diff(moment(firsttest.meta.StartDateTime)));
                            obj.data.hour = Math.round(duration.asHours());
                            obj.mid = firsttest.mid;
                        }

                        obj.timestamp = moment().toDate();
                        obj.type = 'link';
                        obj.subtype = 'test';
                        obj.result = 'X';
                        obj.status = 'X';
                        obj.measstatus = 'X';
                        obj.device.SerialNumber = obj.data.transceiverSN;
                        obj.device.ManufactureSerialNumber = null;
                        obj.device.PartNumber = obj.data.pnum || 'XQX4000';
                        obj.device.PartType = 'ENG';
                        obj.meta.StartDateTime = date.toDate();
                        obj.meta.EndDateTime = date.toDate();

                        Testdata.insert(obj);
                    }
                }
            }
            SyncFiles.update({_id: row._id}, {$set: {processed: true}});
        }
    }
}

