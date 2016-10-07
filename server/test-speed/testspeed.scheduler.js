/**
 * Scheduled jobs for mongo aggregation
 * @type {meteor.startup}
 */
//
// Meteor.startup(function () {
//     SyncedCron.add({
//         name: 'Calculate test speed for 100GB',
//         schedule: function (parser) {
//             // parser is a later.parse object
//             return parser.text('every 2 hours');
//         },
//         job: function () {
//             execSpeed();
//             return true;
//         }
//     });
// });
//
//
// // For testing in development
// Meteor.methods({
//     'speedcalc': function () {
//         ScesDomains.getUser(this.userId);
//         execSpeed();
//         return true;
//     }
// });
//
// function execSpeed () {
//     // Get list of serials that are changed from last compilation
//     let serials = getPartsAddedFromLastDate();
//     // Get all testdata for pnum from certain date and aggregate by serial number and mid
//     processLastTestData(serials);
// }
//
// function processLastTestData (serials) {
//     // Loop through the test aggregation by serial number and check fail conditions
//     let offset = Math.abs(moment().utcOffset() * 60000);
//     let lastTestAggregation =
//         [{
//             // Just serials that match
//             $match: {
//                 'device.SerialNumber': {
//                     $in: serials
//                 },
//                 status: 'P',
//                 // Just scripts with name Full
//                 'meta.ScriptName': 'Full',
//                 // Filter out all tests that didn't finish
//                 'meta.EndDateTime': {$ne: null}
//             }
//         }, {
//             $project: Scheduler.getYieldProject()
//         }, {
//             // First sort by serial, mid and date
//             $sort: {
//                 sn: 1,
//                 mid: 1,
//                 sd: 1
//             }
//         }, {
//             // Group by serial and tests to prepare for finding last tests
//             $group: {
//                 _id: {
//                     sn: '$sn',
//                     mid: '$mid',
//                     tst: '$tst'
//                 },
//                 ed: {
//                     $last: '$ed'
//                 },
//                 sd: {
//                     $first: '$sd'
//                 },
//                 rack: {
//                     $last: '$rack'
//                 }
//             }
//         }, {
//             $project: {
//                 sn: '$_id.sn',
//                 rack: '$rack',
//                 tst: '$_id.tst',
//                 day: {
//                     $dateToString: {
//                         format: '%Y-%m-%d', date: {
//                             $subtract: ['$ed', offset]
//                         }
//                     }
//                 },
//                 time: {
//                     $subtract: ['$ed', '$sd']
//                 }
//             }
//         }, {
//             // Filter out values that do not make sense
//             $match: {
//                 time: {$gt: 0, $lt: 100000000}
//             }
//         }, {
//             $group: {
//                 _id: {
//                     rack: '$rack',
//                     tst: '$tst',
//                     day: '$day'
//                 },
//                 time: {
//                     $avg: {$divide: ['$time', 1000]}
//                 }
//             }
//         }];
//     let testSpeed = Testdata.aggregate(lastTestAggregation);
//     insertTestSpeed(testSpeed);
// }
//
//
// function insertTestSpeed (data) {
//     _.each(data, (row) => {
//         TestSpeed.upsert({
//             Rack: row._id.rack,
//             Tst: row._id.tst,
//             Day: new Date(row._id.day + ' 08:00:00')
//         }, {
//             $set: {
//                 Time: row.time,
//                 Result: 'PASS',
//                 Script: 'Full',
//                 DUT: ''
//             }
//         });
//     });
// }
//
// function getLastSyncDate (domain) {
//     let syncstart = Syncstart.findOne({domain: domain});
//     if (!syncstart) {
//         let date = moment('2016-04-29').toDate();
//         Syncstart.insert({
//             domain: domain,
//             start: date
//         });
//         return date;
//     } else {
//         Syncstart.update({
//             domain: domain
//         }, {
//             $set: {
//                 start: moment().toDate()
//             }
//         });
//         return syncstart.start;
//     }
// }
//
// function getPartsAddedFromLastDate () {
//     // Retrieve last sync datetime
//     let lastDate = getLastSyncDate('SPEED_100GB');
//     // let lastDate = moment('2016-05-28').toDate();
//     // First return list of serials that are changed from last sync date
//     let list = Testdata.aggregate([{
//         $match: {
//             'device.PartNumber': 'XQX4000',
//             timestamp: {
//                 $gte: lastDate
//             }
//         }
//     }, {
//         $group: {
//             _id: '$device.SerialNumber',
//             cnt: {$sum: 1}
//         }
//     }]);
//     return _.pluck(list, '_id');
// }
