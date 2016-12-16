'use strict';


/**
 * Account Methods
 * @type {meteor.methods}
 */
Meteor.methods({
    importRosaData: function (data) {
        ScesDomains.getUser(this.userId);
        let pc = 0;
        let dataDef = data[0].reduce(function (o, v, i) {
            o[i] = v;
            pc += 1;
            return o;
        }, {});

        for (let i = 1; i < data.length; i++) {
            let td = {data: {}, meta: {}, device: {}};
            let dt = data[i];
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
        return data.length - 1;
    }
});
