/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Prepare collection for test insertions',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 8 hours');
        },
        job: function () {
            return exec();
        }
    });
});

// For testing in development
Meteor.methods({
    'calctestins': function () {
        ScesDomains.getUser(this.userId);
        exec();
    }
});

function exec () {

    let match = {
        'device.PartNumber': {
            $regex: '^XQX4|^XQX3|^XQX2'
        },
        'timestamp': {
            $gt: moment().subtract(30, 'days').toDate()
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
    };

    let project = {
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
    };

    let group1 = {
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
    };

    let group2 = {_id: {date: '$_id.date', rack: '$_id.Rack'}, pnum: {$last: '$_id.PartNumber'}, total: {$sum: 1}};
    Testdata.aggregate([
        {$match: match},
        {$project: project},
        {$group: group1},
        {$group: group2},
        {
            $project: {
                _id: '$__id',
                date: '$_id.date',
                rack: '$_id.rack',
                pnum: '$pnum',
                total: '$total'
            }
        },
        {
            $sort: {
                'rack': 1,
                'pnum': 1,
                'date': 1
            }
        }, {
            $out: 'insertionsByRack'
        }
    ]);

    group2 = {_id: {date: '$_id.date', pnum: '$_id.PartNumber'}, total: {$sum: 1}};
    Testdata.aggregate([
        {$match: match},
        {$project: project},
        {$group: group1},
        {$group: group2},
        {
            $project: {
                _id: '$__id',
                date: '$_id.date',
                rack: '$_id.rack',
                pnum: '$_id.pnum',
                total: '$total'
            }
        },
        {
            $sort: {
                'rack': 1,
                'pnum': 1,
                'date': 1
            }
        }, {
            $out: 'insertionsByPnum'
        }
    ]);
}
