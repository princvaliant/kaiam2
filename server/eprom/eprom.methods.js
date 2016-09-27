
let base64 = require('base64-js');
let Excel = require('exceljs');
let Future = require('fibers/future');
let unstream = require('unstream');


/**
 * TestSpeed method functions
 * @type {meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */

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

    exportEprom: function (data) {
        let future = new Future();
        let workbook = new Excel.Workbook();
        workbook.xlsx.readFile('assets/app/excel/eprom.xlsx')
            .then(() => {
                workbook.creator = 'Alex';
                workbook.lastModifiedBy = 'Alex';
                workbook.created = new Date();
                workbook.modified = new Date();
                workbook.eachSheet(function(worksheet, id) {
                    if (id === 1) {
                        id = 0;
                    }
                    for (let i = 128; i <= 255; i++) {
                        worksheet.getCell('E' + (i - 124)).value = data[id].list[i].hex;
                        worksheet.getCell('D' + (i - 124)).value =  { formula: 'HEX2DEC(E' + (i - 124) + ')'};
                        worksheet.getCell('F' + (i - 124)).value =  { formula: 'CHAR(D' + (i - 124) + ')'};
                    }
                });
                workbook.xlsx.write(unstream({}, function (bytes) {
                    future.return(base64.fromByteArray(bytes));
                }));
            });
        return future.wait();
    }
});
