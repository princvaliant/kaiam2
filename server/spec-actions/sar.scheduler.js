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
    'sarcalc': function (code) {
        // ScesDomains.getUser(this.userId);
        let pnums = _.keys(Settings.partNumbers);
        _.each(pnums, (pnum) => {
            // Loop through all part numbers and execute only for 100GB
            if (Settings.partNumbers[pnum].device === '100GB') {
                execSar(pnum, code, false);  // testing with snum
            }
        });
    }
});


function execSar (pnum, snum, calcVars = true) {
    // Get latest spec revision for the pnum
    let sarDef = Sar.findOne({pnum: pnum, class: 'SPEC', active: 'Y'}, {sort: {rev: -1}});
    // Get latest revision of flow definition
    let flowDef = Sar.findOne({pnum: pnum, class: 'FLOW', active: 'Y'}, {sort: {rev: -1}});
    if (sarDef && flowDef) {
        // Get valid spec ranges for sar named 'Spec'
        let specs = getSpecRanges(sarDef);

        // Group tests in spec by order number (One order number represents one measurement ID)
        // Distribute specs through the flow items
        let flows = getFlowsGroupedByOrder(flowDef, specs);

        // Get list of serials that are changed from last compilation
        let lastDate = getLastSyncDate('SPEC_' + pnum);
        let mom = moment(lastDate);

        // Increment date range weekly
        for (let m = mom; m.isBefore(moment()); m.add(7, 'days')) {

            // Find start end end of week for that range
            let sw = moment(m).startOf('week');
            let ew = moment(m).endOf('week');

            // Get all serials for part number that have testdata inserted between dates
            // or use one from parameter
            let serials = [];
            if (snum) {
                serials = [snum];
            } else {
                serials = getPartsChangedBetweenDates(pnum, sw, ew);
            }

            // Loop through all the serials to calculate custom variables for last measurement
            if (calcVars) {
                for (let i = 0; i < serials.length; i++) {
                    _.each(flows, (flow) => {
                        calculateCustomVars(getLastTestData(pnum, serials[i], ew.toDate(), flow.tests));
                    });
                }
            }
            // Loop through the test flow and compile test data
            for (let i = 0; i < serials.length; i++) {
                let doList = [];
                let dateCursor = moment('2000-01-01').toDate();
                _.each(flows, (flow) => {
                    // Find last test data for tests
                    let lastData = getLastTestData(pnum, serials[i], ew.toDate(), flow.tests);
                    if (dateCursor !== null && lastData.length > 0 && lastData[lastData.length - 1].sd > dateCursor) {
                        doList.push({
                            flow: flow,
                            data: lastData
                        });
                        dateCursor = lastData[lastData.length - 1].sd;
                    } else {
                        doList.push({
                            flow: flow,
                            data: []
                        });
                        dateCursor = null;
                    }
                });
                // Compile spec and determine pass or fail
                compileDoList(doList, sarDef, pnum, serials[i], ew);
            }
        }
    } else {
        sar = {_id: ''};
    }

    // Get sars that are forced to calculate
    // let sars = Sar.find({pnum: pnum, recalcForce: true}).fetch();
    // Sar.update({_id: s._id}, {$set: {recalcForce: false}});
}

function calculateCustomVars (items) {
    // Prepare custom calculation
    SarCalculation.init()
    if (items) {
        _.each(items.data, (item) => {
            // Add data for custom calculation
            SarCalculation.add(item);
        });
    }
    // Execute custom processing
    SarCalculation.execute();
}

function compileDoList (doList, sarDef, pnum, sn, ew) {
    let racks = new Set();
    let duts = new Set();
    // List of failed tests
    let failTests = new Set();
    // List of tests that are missing
    let missingTests = new Set();
    // List of tests that failed together with parameters that failed
    let failTestsWithCodes = new Set();

    // Determine if there is last error for this measurement
    let errorItem = getLastTestData(pnum, sn, ew.toDate(), ['actionstatus - error'])[0];
    if (errorItem) {
        // Find test items that errored
        let errors = [];
        _.each(doList, (doItem) => {
            _.each(doItem.data, (itm) => {
                if (itm.r === 'E') {
                    errors.push(itm);
                }
            });
        });
        if (errors && errors.length > 0) {
            _.each(errors, (testErrored) => {
                racks.add(testErrored.rack);
                duts.add(testErrored.dut);
                failTests.add(testErrored.t + '-' + testErrored.s);
                failTestsWithCodes.add(testErrored.t + ' - ' + testErrored.s + ' - ' + errorItem.data.TestErr[0]);
            });
            updateMeasurementStatus(errorItem.sn, errorItem.pnum, errors[0].mid, 'E');
            updateOverallStatus(errorItem.sn, errorItem.pnum, doList, 'E');
            insertTestSummary(errorItem.sn, errorItem.pnum, errorItem.sd, racks, duts, sarDef.name, sarDef.rev, failTests, failTestsWithCodes, 'E');
            return;
        }
    }

    for(let i = 0; i < doList.length; i++) {
        let doItem = doList[i];
        // doItem: {
        //   data: [{
        //         channel = 0
        //         data = Object
        //         dut = "Station1"
        //         mid = "9a31390a-2d29-41e1-9c78-82166b6855e8"
        //         pnum = "XQX4000"
        //         r = "P"
        //         rack = "TestStation1"
        //         s = "rx"
        //         sd = Mon Oct 17 2016 11:31:59 GMT-0700 (PDT)
        //         sn = "Q6041"
        //         st = "P"
        //         t = "functionaltest"
        //         tf = Array[0]
        //         tmpr = 99.9
        //         tst = "functionaltest - rx"
        //         volt = 0
        //         _id = "e5f3013a-d350-48de-938f-c6c7905c4984"
        //     }],
        //   flow: {
        //     required: 'Y',
        //     specs: [{
        //             max = ""
        //             min = 10
        //             param = "CwdmMaskMargin"
        //             subtype = "channeldata"
        //             temperature = 0
        //             tst = "txtests - channeldata"
        //             type = "txtests"
        //             _id = "qbGtW4AxHhEf65DnK"
        //     }],
        //     tests: ['txtests - channeldata']
        //   }

        // Check if all tests are present in data
        let tsts = _.map(doItem.data, (d) => {
            return d.tst;
        });
        let mtsts = _.difference(doItem.flow.tests, tsts || []);
        // Check first if this flow step is required
        if (doItem.flow.required === 'Y' && mtsts.length > 0) {
            // Mark measstatus X and status X
            updateOverallStatus(sn, pnum, doList, 'X');
            _.each(mtsts, (test) => {
                failTests.add(test.split(' ').join('') + ' - M');
                failTestsWithCodes.add(test + ' - M');
            });
            insertTestSummary(sn, pnum, ew.toDate(), racks, duts, sarDef.name, sarDef.rev, failTests, failTestsWithCodes, 'X');
            return;
        } else if (doItem.data.length > 0) {
            // Determine if error is determined by test software
            let testsMarkedFailed = _.filter(doItem.data, function (item) {
                let tf = item.tf || [];
                return tf.length > 0 || item.r === 'F';
            });
            if (testsMarkedFailed && testsMarkedFailed.length > 0) {
                _.each(testsMarkedFailed, (testMarkedFailed) => {
                    let failCodesPerId = new Set();
                    racks.add(testMarkedFailed.rack);
                    duts.add(testMarkedFailed.dut);
                    failTests.add(testMarkedFailed.t + '-' + testMarkedFailed.s);
                    if (testMarkedFailed.tf.length === 0) {
                        testMarkedFailed.tf = ['unknown error'];
                    }
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
                let tmf = testsMarkedFailed[0];
                updateMeasurementStatus(tmf.sn, tmf.pnum, tmf.mid, 'F');
                updateOverallStatus(tmf.sn, tmf.pnum, doList, 'F');
                insertTestSummary(tmf.sn, tmf.pnum, tmf.sd, racks, duts, sarDef.name, sarDef.rev, failTests, failTestsWithCodes, 'F');
                return;
            }

            // If there is no spec just mark test as passed
            if (doItem.flow.specs.length === 0) {
                let itm = doItem.data[0];
                updateMeasurementStatus(itm.sn, itm.pnum, itm.mid, 'P');
            }

            // Loop through each spec item for this serial number if there is no error
            let date = null;
            _.each(doItem.flow.specs, (spec) => {
                // Get test that contains test, subtest and temperature from spec
                let testItems = _.filter(doItem.data, (itm) => {
                    if (_.isDate(itm.sd)) {
                        date = itm.sd;
                    }
                    if (spec.temperature === null || isNaN(spec.temperature)) {
                        return spec.type === itm.t &&
                            spec.subtype === itm.s;
                    } else {
                        return spec.type === itm.t &&
                            spec.subtype === itm.s &&
                            spec.temperature === itm.tmpr;
                    }
                });
                if (testItems.length === 0) {
                    // This test is missing, add it to missing tests
                    missingTests.add(spec.type + '-' + spec.subtype);
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
                        if (!_.isNumber(val)) {
                            val = parseFloat(val);
                        }

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
                        // Flag testdata record with the proper fail status
                        Testdata.update({
                            '_id': testItem.id
                        }, {
                            $set: {
                                failCodes: testItem.failCodes,
                                result: result
                            }
                        }, {
                            multi: true
                        });
                    });
                }
            });

            // Determine if all tests exist and status of each test
            let itm = doItem.data[0];
            if (missingTests.size > 0 || failTests.size > 0) {
                updateMeasurementStatus(itm.sn, itm.pnum, itm.mid, 'F');
                break;
            } else {
                updateMeasurementStatus(itm.sn, itm.pnum, itm.mid, 'P');
            }
        }
    }

    if (doList.length > 0) {
        let status = '';
        let itm = doList[0].data[0];
        if (missingTests.size > 0 || failTests.size > 0) {
            status = 'F';
        } else {
            status = 'P';
        }
        updateOverallStatus(itm.sn, itm.pnum, doList, status);
        insertTestSummary(itm.sn, itm.pnum, itm.sd, racks, duts, sarDef.name, sarDef.rev, failTests, failTestsWithCodes, status);
    }
}

function updateMeasurementStatus(serial, pnum, mid, measstatus) {
    Testdata.update(
        {
            'device.SerialNumber': serial,
            'device.PartNumber': pnum,
            'mid': mid
        }, {
            $set: {
                measstatus: measstatus
            }
        }, {
            multi: true
        }
    );
}

function updateOverallStatus(serial, pnum, doList, status) {
    let mids = _.map(doList, (doItem) => {
        if (doItem.data.length > 0) {
            return doItem.data[0].mid;
        }
        return undefined;
    });
    Testdata.update(
        {
            'device.SerialNumber': serial,
            'device.PartNumber': pnum,
            'mid': {$in: mids}
        }, {
            $set: {
                status: status
            }
        }, {
            multi: true
        }
    );
}

function insertTestSummary (serial, pnum, date, racks, duts, revname, revnum, failTests, failTestsWithCodes, status) {
    let tsts = _.uniq(_.map([...failTests], function (ft) {
        return ft.replace('-', ' - ');
    })).sort();
    let d = moment(date).format('YYYY-MM-DD');
    let nd = moment(date).format('YYYYDDD');
    let w = parseInt(moment(date).format('WW'));
    let nw = moment(date).format('YYYYWW');
    let m = parseInt(moment(date).format('MM'));
    let nm = moment(date).format('YYYYMM');
    let set = {
        sn: serial,
        w: w,
        nw: nw,
        d: d,
        nd: nd,
        m: m,
        nm: nm,
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
        let date = moment('2016-09-01').toDate();
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

function getFlowsGroupedByOrder (flow, specs) {
    let flows = SarFlow.aggregate([{
        $match: {
            sarId: flow._id
        }
    }, {
        $group: {
            _id: '$order',
            tests: {
                $push: {
                    $concat: ['$type', ' - ', '$subtype']
                }
            },
            required: {
                $first: '$required'
            }
        }
    }, {
        $sort: {
            _id: 1
        }
    }]);

    for (let i = 0; i < flows.length; i++) {
        flows[i].specs = [];
       _.each(specs, (spec) => {
            if (_.contains(flows[i].tests, spec.tst)) {
                flows[i].specs.push(spec);
            }
       });
    }
    return flows;
}

function commonAggregation (pnum, serial, endWeek, tests) {
    return [{
        $match: {
            'device.SerialNumber': serial,
            'device.PartNumber': pnum,
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
        $match: {
            tst: {
                $in: tests
            }
        }
    }, {
        // First sort by serial and date
        $sort: {
            sn: 1,
            sd: 1
        }
    }];
}

function getLastTestData (pnum, serial, ew, tests) {
    let lastTestAggregation = commonAggregation(pnum, serial, ew, tests).concat([{
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
        $project: {
            _id: '$items.__id',
            sn: '$_id.sn',
            mid: '$items.mid',
            tst: '$items.tst',
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
            tst: {$concat: ['$type', ' - ', '$subtype']},
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
            execSar(pnum, snum, false);
            return Testsummary.findOne(
                {
                    sn: sn
                }, {
                    sort: {
                        d: -1
                    }
                });
        }
    }
});