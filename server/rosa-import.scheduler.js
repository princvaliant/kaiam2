/**
 * Scheduled jobs forlink test data processing
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Import rosa data',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            execRosaData();
        }
    });
});

// For testing in development
Meteor.methods({
    'rosadata': function () {
        execRosaData();
    }
});

function execRosaData () {
    let row = true;
    while (row) {
        row = SyncFiles.findOne({source: 'DB1', path: '//F1/Public/mmodric_public/ROSA', processed: false}, {sort: {dateCreated: 1}});
        if (row) {
            let data = Papa.parse(row.content);
            if (data && data.data) {
                let pc = 0;
                let dataDef = data.data[0].reduce(function (o, v, i) {
                    o[i] = v;
                    pc += 1;
                    return o;
                }, {});
                for (let i = 1; i < data.data.length; i++) {
                    let td = {data: {}, meta: {}, device: {}};
                    let dt = data.data[i];
                    for (let j = 0; j < pc; j++) {
                        if (dataDef[j] === 'SN') {
                            td._id = 'ROSA-' +  dt[j];
                            td.mid = 'ROSAMID-' +  dt[j];
                            td.device.SerialNumber = dt[j];
                            td.type = 'rosa';
                            td.subtype = 'dc';
                            td.status = 'P';
                            td.measstatus = 'P';
                            td.result = 'P';
                        } else if (dataDef[j] === 'Date') {
                            td.timestamp = moment(dt[j], 'DD-MMM-YYYY').toDate();
                            td.meta.StartDateTime = moment(dt[j], 'DD-MMM-YYYY').toDate();
                            td.meta.EndDateTime = moment(dt[j], 'DD-MMM-YYYY').toDate();
                        } else {
                            if (_.isFinite(dt[j])) {
                                td.data[dataDef[j]] = parseFloat(dt[j]);
                            }
                        }
                    }
                    Testdata.upsert({_id: td._id}, td);
                }
            }
            SyncFiles.update({_id: row._id}, {$set: {processed: true}});
        }
    }
    return true;
}

