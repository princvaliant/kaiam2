'use strict';
/**
 * Test Insertions publish functions
 */


Meteor.methods({
    testInsertions: function () {
        // Date and week range values
        ScesDomains.getUser(this.userId);

        let match = {
            'device.PartNumber': {
                $regex: '^XQX4'
            },
            'timestamp': {
                $gt: moment().subtract(20, 'days').toDate()
            },
            'type': {
                $nin: ['calibration', 'functionaltest', 'packout']
            },
            'meta.Rack': {
                $nin: ['TestStation1', '', null, 'Packout']
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
                ScriptName: '$ScriptName',
                status: '$status'
            }, total: {$sum: 1}
        };

        let group2 =
        {_id: {date: '$_id.date', rack: '$_id.Rack'}, total: {$sum: 1}};

        return Testdata.aggregate([
            {$match: match},
            {$project: project},
            {$group: group1},
            {$group: group2},
            {$project: {
                date: '$_id.date', rack: '$_id.rack', total: '$total'
            }},
            {$sort: {
                'rack': 1,
                'date': 1
            }}
        ]);
    }
});
