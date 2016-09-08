/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */

Meteor.startup(function () {
    SyncedCron.add({
        name: 'Calculate specs',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('every 1 hour');
        },
        job: function () {
            let pnums = _.keys(Settings.partNumbers);
            _.each(pnums, (pnum) => {
                if (Settings.partNumbers[pnum].device === '100GB') {
                    execSar(pnum);
                }
            });
        }
    });
});


// For testing in development
Meteor.methods({
    'sarcalc': function () {
        // ScesDomains.getUser(this.userId);
        let pnums = _.keys(Settings.partNumbers);
        _.each(pnums, (pnum) => {
            if (Settings.partNumbers[pnum].device === '100GB') {
                execSar(pnum);
            }
        });
    }
});


function execSar (pnum) {
    // Get latest spec revision for the pnum
    let sar = Sar.findOne({pnum: pnum, class: 'SPEC', active: 'Y'}, {sort: {rev: -1}});
    if (sar) {
        // Get valid spec ranges for sar named 'Test'
        let specs = getSpecRanges(sar);
        if (specs.length > 0) {
            // Get list of serials that are changed from last compilation
            let lastDate = getLastSyncDate('SPEC_' + pnum);
            let mom = moment(lastDate);
            for (let m = mom; m.isBefore(moment()); m.add(7, 'days')) {
                let sw = moment(m).startOf('week');
                let ew = moment(m).endOf('week');
                let serials = getPartsChangedBetweenDates(pnum, sw, ew);
                // serials = ['Q4801'];  // testing
                for (let i = 0; i < serials.length; i += 10) {
                    let array = serials.slice(i, i + 10);
                    // Get all testdata for pnum from certain date and aggregate by serial number and mid
                    processCustomVars(getLastTestData(pnum, array, ew.toDate()));
                    processLastTestData(pnum, getLastTestData(pnum, array, ew.toDate()), specs, getSpecOrder(sar), sar);
                }
            }
        }
    } else {
        sar = {_id: ''};
    }

    // Get sars that are forced to calculate
    let sars = Sar.find({pnum: pnum, recalcForce: true}).fetch();
    _.each(sars, (s) => {
        let specs = getSpecRanges(s);
        if (specs.length > 0) {
            // Get list of serials that are changed from last compilation
            let serials = getPartsForDatesAndSerials(pnum, s.recalcFromDate, s.recalcToDate, s.recalcSnList);
            // Create chunks of 10 serials and process them
            for (let i = 0; i < serials.length; i += 10) {
                let array = serials.slice(i, i + 10);
                // Get all testdata for pnum from certain date and aggregate by serial number and mid
                processCustomVars(getLastTestData(pnum, array, s.recalcToDate));
                processLastTestData(pnum, getLastTestData(pnum, array, s.recalcToDate), specs, getSpecOrder(s), s);
            }
        }
        Sar.update({_id: s._id}, {$set: {recalcForce: false}});
    });
}

function processCustomVars (testData) {
    // Prepare custom calculation
    SarCalculation.init();
    _.each(testData, (testDataGroupBySn) => {
        let items = testDataGroupBySn.items;
        _.each(items, (item) => {
            // Add data for custom calculation
            SarCalculation.add(item);
        });
    });
    // Execute custom processing
    SarCalculation.execute();
}

function processLastTestData (pnum, testData, specs, specTestSorted, sar) {
    // Loop through the test aggregation by serial number and check fail conditions

    // Retrieve order number from the spec to determine which tests have the same order number as txtests
    let orderNo = _.filter(specTestSorted, (o) => {
        return o.t.match(/^txtests/);
    })[0]['order'];
    let primaryTests = _.pluck(_.where(specTestSorted, {order: orderNo}), 't');
    let secondaryTests = _.difference(_.pluck(specTestSorted, 't'), primaryTests);

    _.each(testData, (testDataGroupBySn) => {
        let serial = testDataGroupBySn._id;
        let items = testDataGroupBySn.items;
        // List that will determine the order of tests
        let allTests = new Set();
        // List of tests that failed
        let failTests = new Set();
        // List of tests that are missing
        let missingTests = new Set();
        // List of tests that failed together with parameters that failed
        let failTestsWithCodes = new Set();
        // Date for this test
        let date = null;
        let racks = new Set();
        let duts = new Set();

        if (items.length > 0) {
            let continueSpec = true;
            // Determine if there is error for this measurement
            let isTestError = _.where(items, {t: 'actionstatus', s: 'error'})[0];
            if (isTestError) {
                let testsErrored = _.where(items, {r: 'E'});
                if (testsErrored) {
                    _.each(testsErrored, (testErrored) => {
                        racks.add(testErrored.rack);
                        duts.add(testErrored.dut);
                        failTests.add(testErrored.t + '-' + testErrored.s);
                        failTestsWithCodes.add(testErrored.t + ' - ' + testErrored.s + ' - ' + isTestError.data.TestErr[0]);
                    });
                    insertTestSummary(serial, pnum, isTestError.sd, racks, duts, sar.name, sar.rev,
                        failTests, failTestsWithCodes, 'E');
                    // Update all test items for this measurement to 'E'
                    Testdata.update(
                        {
                            'device.SerialNumber': serial,
                            'device.PartNumber': pnum
                        }, {
                            $set: {
                                status: 'E'
                            }
                        }, {
                            multi: true
                        }
                    );
                    continueSpec = false;
                }
            }

            if (continueSpec === true) {
                // Determine if there is TestFail populated in any record
                let testsMarkedFailed = _.filter(items, function (item) {
                    let tf = item.tf || [];
                    if (tf.length > 0) {
                        return true;
                    }
                    return false;
                });
                if (testsMarkedFailed && testsMarkedFailed.length > 0) {
                    _.each(testsMarkedFailed, (testMarkedFailed) => {
                        let failCodesPerId = new Set();
                        racks.add(testMarkedFailed.rack);
                        duts.add(testMarkedFailed.dut);
                        failTests.add(testMarkedFailed.t + '-' + testMarkedFailed.s);
                        _.each(testMarkedFailed.tf, (tf) => {
                            failTestsWithCodes.add(testMarkedFailed.t + ' - ' + testMarkedFailed.s + ' - ' + tf);
                            failCodesPerId.add(tf);
                        });
                        Testdata.update({
                            '_id': testMarkedFailed.id
                        }, {
                            $set: {
                                failCodes: [...failCodesPerId].sort()
                            }
                        }, {
                            multi: true
                        });
                    });
                    insertTestSummary(serial, pnum, testsMarkedFailed[0].sd, racks, duts, sar.name, sar.rev,
                        failTests, failTestsWithCodes, 'F');
                    // Update all test items for this measurement to 'F'
                    Testdata.update(
                        {
                            'device.SerialNumber': serial,
                            'device.PartNumber': pnum
                        }, {
                            $set: {
                                status: 'F'
                            }
                        }, {
                            multi: true
                        }
                    );
                    continueSpec = false;
                }
            }


            // Loop through each spec  item for this serial number if there is no error
            if (continueSpec === true) {
                _.each(specs, (spec) => {
                    // Get test that contains test, subtest and temperature from spec
                    let testItems = _.filter(items, (itm) => {
                        if (_.isDate(itm.sd)) {
                            date = itm.sd;
                        }
                        return spec.type === itm.t &&
                            spec.subtype === itm.s &&
                            spec.temperature === itm.tmpr;
                    });
                    if (testItems.length === 0) {
                        // This test is missing, add it to missing tests
                        missingTests.add(spec.type + '-' + spec.subtype);
                        //console.log(JSON.stringify(testItem));
                    } else {
                        _.each(testItems, (testItem) => {
                            date = testItem.sd;
                            racks.add(testItem.rack);
                            duts.add(testItem.dut);
                            // Temporary list of fail codes
                            if (!testItem.failCodes) {
                                testItem.failCodes = [];
                            }
                            // console.log(JSON.stringify(testItem.failCodes));
                            // Loop through all params in spec to find if value is within range

                            // Get value for the parameter
                            let val = testItem.data[spec.param];

                            if (_.isNumber(val) === true && _.isNumber(spec.min) === true) {
                                if (val < spec.min) {
                                    // Append _L explaining that value is under min range
                                    testItem.failCodes.push(spec.param + '|L');
                                }
                            }
                            if (_.isNumber(val) === true && _.isNumber(spec.max) === true) {
                                if (val > spec.max) {
                                    // Append _H explaining that value is over max range
                                    testItem.failCodes.push(spec.param + '|H');
                                }
                            }
                            if (val === undefined) {
                                // Append _M explaining that parameter is missing in test record
                                testItem.failCodes.push(spec.param + '|M');
                            } else if (val + '' === 'NaN') {
                                testItem.failCodes.push(spec.param + '|M');
                            }

                            let result = testItem.failCodes.length === 0 ? 'OK' : 'ERR';
                            if (result === 'ERR') {
                                // Add this test type and subtype to failed tests list for serial
                                failTests.add(testItem.t + '-' + testItem.s);
                                _.each(testItem.failCodes, (failCode) => {
                                    failTestsWithCodes.add(testItem.t + ' - ' + testItem.s + ' - ' + failCode);
                                });
                            }
                            // Store this test type to map with date for test order check
                            allTests.add(testItem.t + '-' + testItem.s);

                            // Flag testdata record with the proper fail status
                            Testdata.update({
                                '_id': testItem.id
                            }, {
                                $set: {
                                    failCodes: testItem.failCodes,
                                    status: 'X',
                                    result: result
                                }
                            }, {
                                multi: true
                            });
                        });
                    }
                });

                // Determine if all tests exist and status of each test
                let status = '';
                let fails = new Set();
                for (let test of primaryTests) {
                    if (missingTests.has(test)) {
                        status = 'X';
                        fails.add(test + '|M');
                        break;
                    } else if (failTests.has(test)) {
                        status = 'F';
                        fails.add(test + '|F');
                        break;
                    } else if (allTests.has(test)) {
                        status = 'P';
                    }
                }
                for (let test of secondaryTests) {
                    if (missingTests.has(test)) {
                        status = 'X';
                        fails.add(test + '|M');
                        break;
                    } else if (failTests.has(test)) {
                        status = 'F';
                        fails.add(test + '|F');
                    }
                }

                Testdata.update(
                    {
                        'device.SerialNumber': serial,
                        'device.PartNumber': pnum
                    }, {
                        $set: {
                            status: status
                        }
                    }, {
                        multi: true
                    }
                );

                // Insert summary table for easy query of pass fail
                insertTestSummary(serial, pnum, date, racks, duts, sar.name, sar.rev,
                    fails, failTestsWithCodes, status);
            }
        }
    });
    console.log('finish latest');
}


function insertTestSummary (serial, pnum, date, racks, duts, revname, revnum, failTests, failTestsWithCodes, status) {
    let tsts = _.uniq(_.map([...failTests], function (ft) {
        return ft.replace('-', ' - ');
    })).sort();
    let d = moment(date).format('YYYY-MM-DD');
    let nd = moment(date).format('YYYYDDD');
    let w = parseInt(moment(date).format('WW'));
    let nw = moment(date).format('YYYYWW');
    let set = {
        sn: serial,
        w: w,
        nw: nw,
        d: d,
        nd: nd,
        rwr: 0,
        pnum: pnum,
        cm: 'Kaiam',
        rack: [...racks].sort(),
        dut: [...duts].sort(),
        usr: '',
        f: status === 'F' ? 1 : 0,
        p: status === 'P' ? 1 : 0,
        e: status === 'E' ? 1 : 0,
        tsts: tsts,
        tstparams: [...failTestsWithCodes].sort(),
        status: status,
        timestamp: date,
        spec: revname + ' ' + revnum
    };

    Testsummary.upsert({
        _id: serial
    }, {
        $set: set
    });

    TestsummaryWeek.upsert({
        _id: serial + nw
    }, {
        $set: set
    });
}

function getLastSyncDate (domain) {
    let syncstart = Syncstart.findOne({domain: domain});
    if (!syncstart) {
        let date = moment('2016-06-06').toDate();
        Syncstart.insert({
            domain: domain,
            start: date
        });
        return date;
    } else {
        Syncstart.update({
            domain: domain
        }, {
            $set: {
                start: moment().subtract(1, 'hours').toDate()
            }
        });
        return syncstart.start;
    }
}

function getSpecOrder (sar) {
    return SarSpec.aggregate([{
        $match: {
            sarId: sar._id
        }
    }, {
        $project: {
            order: '$order',
            t: {
                $concat: ['$type', '-', '$subtype']
            }
        }
    }, {
        $sort: {
            order: 1,
            t: 1
        }
    }]);
}

function commonAggregation (pnum, serials, endWeek) {
    return [{
        $match: {
            'device.SerialNumber': {
                $in: serials
            },
            'device.PartNumber': pnum,
            'type': {
                $nin: ['packout', 'link', 'download']
            },
            'data.ActionName': {
                $ne: 'Packout'
            },
            'timestamp': {
                $lte: endWeek
            }
        }
    }, {
        $project: _.extend(
            Scheduler.getYieldProject(),
            {
                data: '$data',
                s: '$subtype',
                tf: '$TestFail',
                setTemperature: '$meta.SetTemperature_C',
                channel: '$meta.Channel',
                volt: '$meta.SetVoltage'
            })
    }, {
        // First sort by serial and date
        $sort: {
            sn: 1,
            sd: 1
        }
    }];
}

function getLastTestData (pnum, serials, ew) {
    let lastTestAggregation = commonAggregation(pnum, serials, ew).concat([{
        // Group by serial and tests to prepare for finding last tests
        $group: {
            _id: {
                sn: '$sn'
            },
            items: {
                $push: {
                    __id: '$__id',
                    mid: '$mid',
                    tst: '$tst',
                    t: '$t',
                    s: '$s',
                    sd: '$sd',
                    pnum: '$pnum',
                    cm: '$cm',
                    rack: '$rack',
                    dut: '$dut',
                    usr: '$usr',
                    r: '$r',
                    st: '$st',
                    tf: '$tf',
                    data: '$data',
                    setTemperature: '$setTemperature',
                    channel: '$channel',
                    volt: '$volt'
                }
            },
            lastmid: {
                $last: '$mid'
            }
        }
    }, {
        // Filter out all tests that are not last
        $project: {
            _id: '$_id',
            items: {
                $filter: {
                    input: '$items',
                    as: 'itm',
                    cond: {
                        '$eq': ['$$itm.mid', '$lastmid']
                    }
                }
            }
        }
    }, {
        // Unwind items in order to group them by serial number
        $unwind: '$items'
    }, {
        $group: {
            _id: '$_id.sn',
            items: {
                $push: {
                    id: '$items.__id',
                    mid: '$items.mid',
                    sn: '$_id.sn',
                    t: '$items.t',
                    s: '$items.s',
                    sd: '$items.sd',
                    pnum: '$items.pnum',
                    cm: '$items.cm',
                    rack: '$items.rack',
                    dut: '$items.dut',
                    usr: '$items.usr',
                    r: '$items.r',
                    st: '$items.st',
                    tf: '$items.tf',
                    data: '$items.data',
                    tmpr: '$items.setTemperature',
                    channel: '$items.channel',
                    volt: '$items.volt'
                }
            }
        }
    }]);
    return Testdata.aggregate(lastTestAggregation, {allowDiskUse: true});
}

function getSpecRanges (sar) {
    // Get active specs for this part number and group them by type, subtype and temperature
    return SarSpec.aggregate([{
        $match: {
            'sarId': sar._id
        }
    }, {
        $lookup: {
            from: 'sarspecranges',
            localField: '_id',
            foreignField: 'sarSpecId',
            as: 'params'
        }
    }, {
        $unwind: '$params'
    }, {
        $match: {
            $or: [{
                'params.testMin': {'$ne': ''}
            }, {
                'params.testMax': {'$ne': ''}
            }]
        }
    }, {
        $project: {
            type: '$type',
            subtype: '$subtype',
            temperature: '$params.temperature',
            param: '$params.param',
            min: '$params.testMin',
            max: '$params.testMax'
        }
    }
    ]);
}


function getPartsChangedBetweenDates (pnum, sw, ew) {
    // First return list of serials that are changed from last sync date
    let list = Testdata.aggregate([{
        $match: {
            'device.PartNumber': pnum,
            timestamp: {
                $gte: sw.toDate(),
                $lte: ew.toDate()
            }
        }
    }, {
        $group: {
            _id: '$device.SerialNumber',
            cnt: {$sum: 1}
        }
    }]);
    return _.pluck(list, '_id');
}

function getPartsForDatesAndSerials (pnum, fromDate, toDate, snList) {
    let match = {
        'device.PartNumber': pnum
    };
    if (fromDate || toDate) {
        match.timestamp = {};
        if (fromDate) {
            match.timestamp.$gte = moment(fromDate).startOf('day').toDate();
        }
        if (toDate) {
            match.timestamp.$lte = moment(toDate).endOf('day').toDate();
        }
    }
    if (snList) {
        match['device.SerialNumber'] = {
            $in: snList.split(',')
        };
    }

    let list = Testdata.aggregate([{
        $match: match
    }, {
        $group: {
            _id: '$device.SerialNumber',
            cnt: {$sum: 1}
        }
    }]);
    return _.pluck(list, '_id');
}

HTTP.methods({
    '/calculateSpec': {
        auth: SarHelper.myAuth,
        get: function () {
            let sn = this.query.sn;
            let pnum = this.query.pnum;
            // Get latest spec revision for the pnum
            let sar = Sar.findOne({pnum: pnum, class: 'SPEC', active: 'Y'}, {sort: {rev: -1}});
            if (sar) {
                // Get valid spec ranges for sar named 'Test'
                let specs = getSpecRanges(sar);
                if (specs.length > 0) {
                    // Get list of serials that are changed from last compilation
                    let serials = [sn];
                    for (let i = 0; i < serials.length; i += 10) {
                        let array = serials.slice(i, i + 10);
                        processCustomVars(getLastTestData(pnum, array, moment().toDate()));
                        processLastTestData(pnum, getLastTestData(pnum, array, moment().toDate()), specs, getSpecOrder(sar), sar);
                    }
                }
                return Testsummary.findOne(
                    {
                        sn: sn
                    }, {
                        sort: {
                            d: -1
                        }
                    });
            }
            else {
                return 'Invalid pnum';
            }
        }
    }
});