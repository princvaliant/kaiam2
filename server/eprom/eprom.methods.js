'use strict';

import BufferStream from '/imports/api/utils/BufferStream';

let base64 = require('base64-js');
let Excel = require('exceljs');
let Future = require('fibers/future');
let unstream = require('unstream');
// let fs = require('fs');


Meteor.methods({
    getLastPackout: function (serial) {
        ScesDomains.getUser(this.userId);
        return Testdata.findOne({
            'device.SerialNumber': serial.toUpperCase(),
            'type': 'packout'
        }, {
            sort: {
                timestamp: -1
            }
        });
    },

    getLastDump: function (serial) {
        ScesDomains.getUser(this.userId);
        return Testdata.findOne({
            'device.SerialNumber': serial.toUpperCase(),
            'type': 'memory',
            'subtype': 'dump'
        }, {
            sort: {
                timestamp: -1
            }
        });
    },

    exportEprom: function (data) {
        let future = new Future();
        let workbook = new Excel.Workbook();
        workbook.xlsx.readFile('assets/app/excel/eprom.xlsx')
            .then(() => {
                workbook.creator = 'Alex';
                workbook.lastModifiedBy = 'Alex';
                workbook.created = new Date();
                workbook.modified = new Date();
                workbook.eachSheet(function (worksheet, id) {
                    if (id === 1) {
                        id = 0;
                    }
                    for (let i = 128; i <= 255; i++) {
                        worksheet.getCell('E' + (i - 124)).value = data[id].list[i].hex;
                        worksheet.getCell('D' + (i - 124)).value = {formula: 'HEX2DEC(E' + (i - 124) + ')'};
                        worksheet.getCell('F' + (i - 124)).value = {formula: 'CHAR(D' + (i - 124) + ')'};
                    }
                });
                workbook.xlsx.write(unstream({}, function (bytes) {
                    future.return(base64.fromByteArray(bytes));
                }));
            });
        return future.wait();
    },

    importEprom: function (content) {
        let future = new Future();
        let _content = content.replace(/^[^,]*,/, '');
        let bytes = base64.toByteArray(_content);
        let workbook = new Excel.Workbook();
        let strm = new BufferStream( Buffer.from(bytes) );
        workbook.xlsx.read(strm).then(wb => {
            let memorydump = '';
            wb.eachSheet(function (worksheet, id) {
                _.times(128, () => {
                    memorydump += '00';
                });
                for (let i = 4; i <= 131; i++) {
                    memorydump += worksheet.getCell('E' + i).value;
                }
                if (id === 1) {
                    _.times(256, () => {memorydump += '00';});
                }
            });
            future.return(memorydump);
        });

        // Write file
        // fs.writeFile('/Users/aleksandarvolos/Downloads/test.xlsx', Buffer.from(bytes),  function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     let stream = fs.createReadStream('/Users/aleksandarvolos/Downloads/test.xlsx');
        //     workbook.xlsx.read(stream).then(wb => {
        //         console.log(wb);
        //     });
        // });


        return future.wait();
    }
});
