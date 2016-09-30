'use strict';


/**
 * Account Methods
 * @type {meteor.methods}
 */
Meteor.methods({
    exportData: function (serial, testType, partNumber, dateFrom, dateTo, errorStatus, ignorePnum, ignoreDate, onlyLast) {
        // Construct field collection to be returned
        ScesDomains.getUser(this.userId);
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

        if (dateFrom !== null && dateTo !== null && (!serial || ignoreDate === false)) {
            query.$and.push({
                'timestamp': {
                    '$gte': dateFrom,
                    '$lte': moment(dateTo).endOf('day').toDate()
                }
            });
        }
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
                        query.$and.push({type: tt[0], subtype: tt[1]});
                    }
                }
            });
        } else {
            let orcmd = {'$or': []};
            query.$and.push();
            _.each(_.keys(Settings.timeTrendShortNames), (key) => {
                _.each(_.keys(Settings.timeTrendShortNames[key]).sort(), (key2) => {
                    orcmd.$or.push({type: key, subtype: key2});
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

        let strTest = '$';
        let aggrArray = [{
            $match: query
        }];

        if (onlyLast) {
            aggrArray.push({
                $sort: {
                    'timestamp': -1
                }
            });
            aggrArray.push({
                $group: {
                    _id: {
                        sn: '$device.SerialNumber'
                    },
                    mid: {
                        $first: '$mid'
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
                $unwind: '$tests'
            });
            strTest = '$tests.';
        }

        aggrArray.push({
            $project: {
                data: strTest + 'data',
                date: strTest + 'meta.StartDateTime',
                mid: strTest + 'mid',
                snum: strTest + 'device.SerialNumber',
                test: strTest + 'type',
                subtest: strTest + 'subtype',
                ares: strTest + 'status',
                mres: strTest + 'measstatus',
                tres: strTest + 'result',
                manuf: {$concat: ['', strTest + 'device.ContractManufacturer']},
                pnum: strTest + 'device.PartNumber',
                t: {$ifNull: [strTest + 'meta.SetTemperature_C', '']},
                v: {$ifNull: [strTest + 'meta.SetVoltage', '']},
                c: {$ifNull: [strTest + 'meta.Channel', '']},
                d: strTest + 'meta.DUT',
                r: strTest + 'meta.Rack',
                swver: {$concat: ['', strTest + 'meta.SwVer']},
                fails: strTest + 'failCodes',
                failsrt: strTest + 'TestFail'
            }
        });

        aggrArray.push({
            $sort: {
                snum: 1,
                test: 1,
                subtest: 1
            }
        });

        aggrArray.push({
            $limit: 12000
        });

        return Testdata.aggregate(aggrArray, {
            allowDiskUse: true
        });
    }
});



