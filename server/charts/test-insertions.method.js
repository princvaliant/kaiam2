'use strict';
/**
 * Test Insertions publish functions
 */


Meteor.methods({
    testInsertions: function (device, groupType) {
        // Date and week range values
        ScesDomains.getUser(this.userId);

        let pnumregex = '^XQX';
        if (device === '100GB') {
            pnumregex = '^XQX4';
        }else if (device === '40GB') {
            pnumregex = '^XQX3|^XQX2';
        }

        let match = {
            'device.PartNumber': {
                $regex: pnumregex
            },
            'timestamp': {
                $gt: moment().subtract(10, 'days').toDate()
            },
            'type': {
                $nin: ['calibration', 'functionaltest', 'packout', 'download']
            },
            'meta.Rack': {
                $nin: ['TestStation1', '', null, 'Packout', 'QSFP-DEV-PC2', 'Production-4']
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
            }, total: {$sum: 1}
        };

        let group2;
        if (groupType === 'rack') {
            group2 = {_id: {date: '$_id.date', rack: '$_id.Rack'}, total: {$sum: 1}};
        } else {
            group2 = {_id: {date: '$_id.date', pnum: '$_id.PartNumber'}, total: {$sum: 1}};
        }

        return Testdata.aggregate([
            {$match: match},
            {$project: project},
            {$group: group1},
            {$group: group2},
            {$project: {
                date: '$_id.date', rack: '$_id.rack', pnum: '$_id.pnum', total: '$total'
            }},
            {$sort: {
                'rack': 1,
                'pnum': 1,
                'date': 1
            }}
        ]);
    }
});
