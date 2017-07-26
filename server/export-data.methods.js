'use strict';


let localCollection = {};
/**
 * Account Methods
 * @type {meteor.methods}
 */
Meteor.methods({
    exportData: function (serial, testType, partNumber, dateFrom, dateTo, errorStatus, ignorePnum, ignoreDate, onlyLast, includeTosa, includeRosa) {
        // Construct field collection to be returned
        let user = ScesDomains.getUser(this.userId);
        let query = {$and: []};

        if (_.isArray(serial)) {
            query.$and.push({
                'device.SerialNumber': {
                    '$in': serial
                }
            });
        } else if (serial) {
            query.$and.push({
                'device.SerialNumber': {
                    '$in': serial.split(/[\s,]+/)
                }
            });
        }

        if (partNumber && (!serial || ignorePnum === false)) {
            query.$and.push({'device.PartNumber': partNumber});
        }

        if (dateFrom !== null && dateTo !== null && (!serial || ignoreDate !== true)) {
            query.$and.push({
                'timestamp': {
                    '$gte': dateFrom,
                    '$lte': moment(dateTo).endOf('day').toDate()
                }
            });
        }

        let fields  = [];

        if (_.isArray(testType) && testType[0] !== 'ALL - ALL') {
            _.each(testType, (o) => {
                if (o) {
                    let tt = o.split(' - ');
                    let st = '';
                    if (tt[0] !== tt[1]) {
                        st = tt[1];
                        st = st.split('|')[0];
                        query.$and.push({type: tt[0], subtype: st});
                    } else {
                        query.$and.push({type: tt[0], subtype: st});
                    }
                    let parms = Settings.getTestConfigVariablesForPartNumber(partNumber, tt[0], st);
                    if (parms.length > 0) {
                        fields  = _.union(fields, parms);
                    }
                }
            });
        } else {
            let orcmd = {'$or': []};
            query.$and.push();
            _.each(_.keys(Settings.timeTrendShortNames), (key) => {
                _.each(_.keys(Settings.timeTrendShortNames[key]).sort(), (key2) => {
                    let parms = Settings.getTestConfigVariablesForPartNumber(partNumber, key, key2);
                    if (parms.length > 0) {
                        orcmd.$or.push({type: key, subtype: key2});
                        fields  = _.union(fields, parms);
                    }
                });
            });
            query.$and.push(orcmd);
        }
        if (errorStatus === 'F') {
            query.$and.push({
                'status': {
                    '$ne': 'P'
                }
            });
        }
        if (errorStatus === 'P') {
            query.$and.push({
                'status': {
                    '$eq': 'P'
                }
            });
        }

        let aggrArray = [{
            $match: query
        }];

        if (onlyLast) {
            aggrArray.push({
                $sort: {
                    'timestamp': 1
                }
            });
            aggrArray.push({
                $group: {
                    _id: {
                        sn: '$device.SerialNumber',
                        t: '$type',
                        st: '$subtype'
                    },
                    lastmid: {
                        $last: '$mid'
                    }
                }
            });
            aggrArray.push({
                $lookup: {
                    from: 'testdata',
                    localField: 'mid',
                    foreignField: 'mid',
                    as: 'tests'
                }
            });
            aggrArray.push({
                // Create final document to be exported to yields collection
                $project: {
                    lasttest: {
                        $filter: {
                            input: '$tests',
                            as: 'tst',
                            cond: {
                                $eq: ['$tst.mid', '$lastmid']
                            }
                        }
                    }
                }
            });
        }

        if (includeTosa) {
            aggrArray.push({
                $lookup: {
                    from: 'domains',
                    localField: 'device.SerialNumber',
                    foreignField: '_id',
                    as: 'doms'
                }
            });
            aggrArray.push({
                $unwind: {
                    path: '$doms'
                }
            });
            aggrArray.push({
                $lookup: {
                    from: 'testdata',
                    localField: 'doms.dc.TOSA',
                    foreignField: 'device.SerialNumber',
                    as: 'tosa'
                }
            });
        }

        if (includeRosa) {
            aggrArray.push({
                $lookup: {
                    from: 'domains',
                    localField: 'device.SerialNumber',
                    foreignField: '_id',
                    as: 'domsr'
                }
            });
            aggrArray.push({
                $unwind: {
                    path: '$domsr'
                }
            });
            aggrArray.push({
                $lookup: {
                    from: 'testdata',
                    localField: 'domsr.dc.ROSA',
                    foreignField: 'device.SerialNumber',
                    as: 'rosa'
                }
            });
        }

        let project = {
            date: '$timestamp',
            mid: '$mid',
            snum: '$device.SerialNumber',
            test: '$type',
            subtest: '$subtype',
            all: '$status',
            meas: '$measstatus',
            row: '$result',
            manuf: {$concat: ['', '$device.ContractManufacturer']},
            pnum: '$device.PartNumber',
            t: {$ifNull: ['$meta.SetTemperature_C', '']},
            v: {$ifNull: ['$meta.SetVoltage', '']},
            c: {$ifNull: ['$meta.Channel', '']},
            d: '$meta.DUT',
            r: '$meta.Rack',
            swver: {$concat: ['', '$meta.SwVer']},
            fails: '$failCodes',
            failsrt: '$TestFail',
            tosa: {
                $filter: {
                    input: '$tosa',
                    as: 'tsa',
                    cond: {
                        $and: [
                            {$eq: ['$$tsa.meta.Channel', '$meta.Channel']},
                            {$eq: ['$$tsa.type', 'tosa']}
                        ]
                    }
                }
            },
            rosa:  {
                $filter: {
                    input: '$rosa',
                    as: 'rsa',
                    cond: {
                        $eq: ['$$rsa.type', 'rosa']
                    }
                }
            },
            lasttest: '$lasttest'
        };
        _.each(fields, (field) => {
            project['data.' + field.v] = '$data.' + field.v;
        });

        aggrArray.push({
            $project: project
        });

        aggrArray.push({
            $sort: {
                snum: 1,
                test: 1,
                subtest: 1
            }
        });

        aggrArray.push({
            $limit: 50000
        });

        let coll = user.username.replace(' ', '_');

        aggrArray.push({
            $out: 'export' + coll
        });

        Testdata.aggregate(aggrArray, {
            allowDiskUse: true
        });

        if (!localCollection[coll]) {
            localCollection[coll] = new Mongo.Collection('export' + coll);
        }
        return localCollection[coll].find().fetch();
    }
});



