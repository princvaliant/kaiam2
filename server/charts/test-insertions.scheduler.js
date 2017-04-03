Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collection for test insertions',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 2 hours');
        },
        job: function () {
            Scheduler.executeAggregate(execPerType('Rack'));
            Scheduler.executeAggregate(execPerType('Pnum'));
            return true;
        }
    });
});


// For testing in development
Meteor.methods({
    'calctestins': function () {
        ScesDomains.getUser(this.userId);
        Scheduler.executeAggregate(execPerType('Rack'));
        Scheduler.executeAggregate(execPerType('Pnum'));
    }
});

function execPerType (type) {
    let pipeline = [{
        $match: {
            'device.PartNumber': {
                $regex: '^XQX4|^XQX3|^XQX2'
            },
            'timestamp': {
                $gt: 'DATEFILTER'
            },
            'type': {
                $nin: ['calibration', 'functionaltest', 'packout', 'download']
            },
            'meta.Rack': {
                $in: Settings.spcRacks100GB.concat(Settings.spcRacks40GB)
            },
            'meta.ScriptName': {
                $nin: ['Control']
            }
        }
    }, {
        $project: {
            timestamp: '$timestamp',
            mid: '$mid',
            Rack: '$meta.Rack',
            DUT: '$meta.DUT',
            date: {$substr: [{$subtract: ['$timestamp', 25200000]}, 0, 10]},
            pacTime: {$subtract: ['$timestamp', 25200000]},
            SerialNumber: '$device.SerialNumber',
            PartNumber: '$device.PartNumber',
            ScriptName: '$meta.ScriptName',
            status: '$status'
        }
    }, {
        $group: {
            _id: {
                date: '$date',
                mid: '$mid',
                Rack: '$Rack',
                station: '$DUT',
                SerialNumber: '$SerialNumber',
                PartNumber: '$PartNumber',
                ScriptName: '$ScriptName',
                status: '$status'
            },
            total: {$sum: 1},
            __id: {$last: '$_id'}
        }
    }, {
        $group: getGroup(type)
    },  {
        $project: {
            _id: '$__id',
            date: '$_id.date',
            rack: '$_id.rack',
            pnum: '$pnum',
            total: '$total'
        }
    }, {
        $sort: {
            'rack': 1,
            'pnum': 1,
            'date': 1
        }
    }, {
        $out: 'insertionsBy' + type
    }];

    let p = JSON.stringify(pipeline);

    p = p.replace('\"DATEFILTER\"', 'new ISODate(\"' + moment().subtract(35, 'days').toISOString() + '\")');

    return p;
}

function getGroup (type) {
    if (type === 'Rack') {
        return {_id: {date: '$_id.date', rack: '$_id.Rack'}, pnum: {$last: '$_id.PartNumber'}, total: {$sum: 1}};
    }
    return {_id: {date: '$_id.date', pnum: '$_id.PartNumber'}, pnum: {$last: '$_id.PartNumber'}, total: {$sum: 1}};
}
