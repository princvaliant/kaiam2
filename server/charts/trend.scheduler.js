'use strict';
/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collection for trends',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hours');
        },
        job: function () {
            let syncstart = Syncstart.findOne({domain: 'trendsync'});
            Syncstart.update({
                domain: 'trendsync'
            }, {
                $set: {
                    start: new Date()
                }
            });
            return exec(syncstart.start);
        }
    });
});


let map = function () {
    for (var i in this.data) {
        emit({
            tt: this.type,
            st: this.subtype,
            p: i,
            s: this.device.SerialNumber,
            c: this.meta.Channel || "",
            t: this.meta.SetTemperature_C || "",
            v: this.meta.SetVoltage ? Number(this.meta.SetVoltage.toFixed(2)) : ""
        }, {
            i: counter,
            srch: [this.device.PartNumber,
                this.device.ContractManufacturer,
                this.meta.Rack,
                this.meta.DUT
            ],
            d: this.meta.StartDateTime,
            n: this.data[i]
        });
    }
    counter += 1;
    if (counter === 40) {
        counter = 1;
    }
};

let reduce = function (id, values) {
    return values[values.length - 1];
};

let options = {
    out: {
        reduce: "trends"
    },
    query: {
        "meta.StartDateTime": {$gt: "DATEFILTER"},
        "type": {
            "$in": _.keys(Settings.testConfig)
        },
        "device.PartNumber": {
            "$nin": Settings.controlPartNumbers
        },
        "$or": [{
            "meta.SetTemperature_C": {
                "$gt": -20,
                "$lt": 120
            }
        }, {
            "meta.SetTemperature_C": {
                $exists: false
            }
        }],
        "meta.Rack": {
            "$in": Settings.racks
        }
    },
    sort: {"meta.StartDateTime": 1},
    scope: {counter: 1}
};

function exec (dateFrom) {
    if (dateFrom) {
        let df = 'new Date("' + moment(dateFrom).format('MM/DD/YYYY hh:mm:ss') + '")';
        Scheduler.executeMapReduce(
            map.toString().replace('map(', '('),
            reduce.toString().replace('reduce(', '('),
            JSON.stringify(options).replace('"DATEFILTER"', df));
    }
};

// For testing in development
Meteor.methods({
    'formattrend': function () {
        ScesDomains.getUser(this.userId);
        return exec(new Date('08/01/2016'));
    }
});
