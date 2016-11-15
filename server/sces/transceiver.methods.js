'use strict';

import {check} from 'meteor/check';

// Contains config based on vendor requirements
let sequenceConfig = {
    XQX4008: {
        seq: 'SEQ11',
        reset: 'isoWeek' // Monday
    },
    XQX4009: {
        seq: 'SEQ11',
        reset: 'isoWeek' // Monday
    },
    XQX4007: {
        seq: 'SEQ2',
        reset: 'week' // Sunday
    },
    XQX5000: {
        seq: 'SEQ3'
    },
    DEFAULT: {
        seq: 'SEQ',
        reset: 'week'  //Sunday
    }
};

HTTP.methods({
    '/getVendorSequence': {
        auth: SarHelper.myAuth,
        get: function () {
            let pnum = this.query.pnum;
            if (!pnum) {
                return 'ERROR - parameter missing: pnum';
            }
            let config = sequenceConfig[pnum] || sequenceConfig.DEFAULT;
            let startDayOfWeek = 'NORESET';
            if (config.reset) {
                startDayOfWeek = moment().startOf(config.reset).format('YYYY-MM-DD');
            }
            let vendorSequence = VendorSequence.findOne({name: config.seq, weekStart: startDayOfWeek});

            if (!vendorSequence) {
                VendorSequence.insert({name: config.seq, weekStart: startDayOfWeek, cnt: 1});
                return 1;
            }
            vendorSequence.cnt += 1;
            VendorSequence.update(vendorSequence._id, vendorSequence);
            return vendorSequence.cnt;

        }
    }
});

Meteor.methods({

    addTransceiverToTray: function (snum, tray, adminOverride) {
        check(snum, String);
        ScesDomains.getUser(this.userId);
        // Check if this serial number is already assigned
        let domain = ScesDomains.getDomain(snum);
        // if (domain && tray.dc.isRma !== true && domain.state.id !== 'AddedToLocation') {
        //     return ScesDomains.addEvent(tray._id, 'error', 'SCES.ITEM-ALREADY-ASSIGNED', snum);
        // }
        // Check if this serial number successfully passed through packout
        let regsnum = new RegExp(snum, 'i');

        let testsumm = Testsummary.findOne(
            {
                sn: {
                    $regex: regsnum
                }
            }, {
                sort: {
                    timestamp: -1
                }
            });
        if (testsumm) {
            // New 100GB products have all the test status info in testsummary collection
            if (testsumm.p !== 1 && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-NO-PACKOUT', snum);
            }
            // Check if successfuly passed through packout
            let packout = Testdata.findOne({
                'device.SerialNumber': {
                    $regex: regsnum
                },
                type: 'packout',
                subtype: 'packout'
            }, {
                fields: {
                    'device': 1,
                    'status': 1
                },
                sort: {
                    timestamp: -1
                }
            });
            if (!packout) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-NO-PACKOUT_AT_ALL', snum);
            }
            if (packout.status !== 'P' && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-NO-PACKOUT', snum);
            }
            // Custom check for script names
            let td = Testdata.findOne({
                'device.SerialNumber': {
                    $regex: regsnum
                },
                type: 'txtests',
                subtype: 'channeldata',
                result: {$in: ['OK', 'P']}
            }, {
                fields: {
                    'device.PartNumber': 1,
                    'device.FwVer': 1,
                    'meta.ScriptName': 1,
                    'meta.ScriptVer': 1
                },
                sort: {
                    timestamp: -1
                }
            });
            // Check if this part is tested with txtests-channeldata
            if (!td) {
                return ScesDomains.addEvent(tray._id, 'error', 'This did not complete txtest-channeldata', snum);
            }
            // Check if firmware version is not smaller then 00.09.28
            if (td.device.FwVer < '00.09.28') {
                return ScesDomains.addEvent(tray._id, 'error', 'Firmware version is smaller than 00.09.28 so it can not be shipped', snum);
            }
            let tdpf = td.device.PartNumber.substring(0, td.device.PartNumber.length - 2);
            if (tdpf === 'XQX40') {
                if ((td.meta.ScriptName.toUpperCase() === 'TESTTUNE' && td.meta.ScriptVer === '10') ||
                    (td.meta.ScriptName.toUpperCase() === 'FULL' && _.contains(['21', '22', '23'], td.meta.ScriptVer))) {
                    return ScesDomains.addEvent(tray._id, 'error', 'XQX40** Script name TESTTUNE:10 or FULL:21,22,23 not allowed for shipout', snum);
                }
            }
            if (tdpf === 'XQX41') {
                if (td.meta.ScriptName.toUpperCase() === 'FULL' && td.meta.ScriptVer === '7') {
                    return ScesDomains.addEvent(tray._id, 'error', 'XQX41** Script name FULL:7 not allowed for shipout', snum);
                }
            }

            // Check if tranceiver serial number is less than 3000 (< Q3000)
            let num = parseInt(snum.match(/\d+/)[0]);
            if (num < 3000) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-SERIAL-NUMBER-NOT-ALLOWED', snum);
            }
            // Check if tray family number matches test family number
            let s1 = testsumm.pnum.substring(0, testsumm.pnum.length - 2);
            let s2 = tray.dc.pnum.substring(0, tray.dc.pnum.length - 2);
            if (s1 !== s2) {
                return ScesDomains.addEvent(tray._id, 'error', 'Test part family does not match tray part family', snum);
            }
            // Check packout partnumber with tray part number
            if (!adminOverride) {
                if (packout.device.PartNumber !== tray.dc.pnum) {
                    return ScesDomains.addEvent(tray._id, 'error', 'Packout part number does not match tray part number', snum);
                }
            }
            // Check if tray is already full
            let tot = tray.dc.type.split('x');
            let totl = parseInt(tot[0]) * parseInt(tot[1]);
            if (Domains.find({
                    parents: tray._id
                }).length >= totl) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.TRAY-IS-FULL', snum);
            }
            if (domain) {
                // If this transceiver already exists move it to tray
                ScesDomains.move(this.userId, snum, [tray._id], [], {isRma: tray.dc.isRma}, [], 'AddedToTray');
            } else {
                // Insert transceiver into domains table
                ScesDomains.create('transceiver', this.userId, snum, [tray._id], {
                    SerialNumber: snum,
                    PartNumber: testsumm.pnum,
                    ContractManufacturer: testsumm.cm
                }, adminOverride ? [testsumm.cm, 'ADMIN_OVERRIDE'] : [testsumm.cm]);
            }
            ScesDomains.addEvent(tray._id, 'add',
                snum + ' transceiver added to tray - CM ' + testsumm.cm, snum);
        } else {
            // 40GB products are checking if testdata contains success packout
            if (snum.length < 8) {
                return ScesDomains.addEvent(tray._id, 'error', 'Invalid serial number', snum);
            }
            let td = Testdata.findOne({
                'device.SerialNumber': {
                    $regex: regsnum
                },
                type: 'packout',
            }, {
                fields: {
                    'status': 1,
                    'device': 1
                },
                sort: {
                    timestamp: -1
                }
            });
            if (!td) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-NO-PACKOUT_AT_ALL', snum);
            }
            if (td.status !== 'P' && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.ERROR-NO-PACKOUT', snum);
            }

            // Check if TOSA or ROSA are not in the list
            if (td.device.TOSA && getTosas().includes(td.device.TOSA) && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.NOT-VALID-TOSA', snum);
            }
            if (td.device.ROSA && getRosas().includes(td.device.ROSA) && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.NOT-VALID-ROSA', snum);
            }
            // Is transceiver on noship list
            if (noShip().includes(snum.toLowerCase())) {
                return ScesDomains.addEvent(tray._id, 'error', 'Transceiver not allowed to be shipped', snum);
            }

            // Check if tray part number matches transceiver
            //
            if (td.device.PartNumber !== tray.dc.pnum && !adminOverride) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.PART-NUMBER-NO-MATCH', snum);
            }

            // Check if tray is already full
            let tot = tray.dc.type.split('x');
            let totl = parseInt(tot[0]) * parseInt(tot[1]);
            if (Domains.find({
                    parents: tray._id
                }).length >= totl) {
                return ScesDomains.addEvent(tray._id, 'error', 'SCES.TRAY-IS-FULL', snum);
            }
            if (domain) {
                // If this transceiver already exists
                ScesDomains.move(this.userId, snum, [tray._id], [], {isRma: tray.dc.isRma}, [], 'AddedToTray');
            } else {
                // Insert transceiver into domains table
                ScesDomains.create('transceiver', this.userId, snum, [tray._id], td.device, [td.device.ContractManufacturer]);
            }
            ScesDomains.addEvent(tray._id, 'add',
                snum + ' transceiver added to tray - CM ' + td.device.ContractManufacturer, snum);
            return '';
        }
    },

    removeTransceiverFromTray: function (snum, tray) {
        check(snum, String);
        ScesDomains.getUser(this.userId);
        if (snum) {
            ScesDomains.move(this.userId, snum, [], [tray._id], {}, [], 'RemovedFromTray');
            ScesDomains.addEvent(tray._id, 'remove',
                snum + ' transceiver removed from tray.', snum);
        }
        return '';
    },

    getTestdata: function (id) {
        check(id, String);
        ScesDomains.isLoggedIn(this.userId);

        let manufSn = id;
        let packout =  Testdata.findOne(
            {
                'device.SerialNumber': id,
                type: 'packout',
                subtype: 'packout'
            }, {
                sort: {
                    'meta.StartDateTime': -1
                }
            });
        if (packout) {
            manufSn = packout.device.ManufSn;
        }

        return Testdata.find({
            $or: [
                {'device.SerialNumber': {$in: [id, manufSn]}},
                {'device.ManufSn': manufSn},
            ]
        }, {
            sort: {
                'meta.StartDateTime': -1
            }
        }).fetch();
    },

    getFailedTestdata: function (id) {
        check(id, String);
        ScesDomains.isLoggedIn(this.userId);
        let testdata = Testdata.aggregate([{
            $match: {
                $or: [{
                    'device.SerialNumber': id
                }, {
                    'device.TOSA': id
                }, {
                    'device.ROSA': id
                }]
            }
        }, {
            $group: {
                _id: {
                    d: '$meta.StartDateTime',
                    sn: '$device.SerialNumber'
                },
                list: {
                    $push: {
                        d: '$meta.StartDateTime',
                        sn: '$device.SerialNumber',
                        t: '$type',
                        st: '$subtype',
                        ts: '$timestamp',
                        s: '$status',
                        r: '$result',
                        rosa: '$device.ROSA',
                        tosa: '$device.TOSA'
                    }
                },
                pnum: {
                    $last: '$device.PartNumber'
                }
            }
        }, {
            $sort: {
                '_id.d': -1
            }
        }])[0];

        if (!testdata) {
            return {status: 'NOID'};
        }

        let pnum = Settings.partNumbers[testdata.pnum];
        if (!pnum) {
            return {status: 'NOID', pnum: testdata.pnum};
        }

        if (pnum.device === '100GB') {
            // If this is 100GB device
            let summ = Testsummary.find({sn: id}, {sort: {timestamp: -1}}).fetch()[0];
            if (summ) {
                if (summ.e > 0) {
                    return {status: 'ERR', pnum: testdata.pnum, data: _returnSummary(summ)};
                }
                return {status: 'OK', pnum: testdata.pnum, data: _returnSummary(summ)};
            }
            return {status: 'NOID', pnum: testdata.pnum};
        } else {
            let filtered = _.filter(testdata.list, (o) => {
                return o.r === 'ERR' || o.s === 'E';
            });
            let ret = _.uniq(filtered, function (o) {
                return o.t + o.st;
            });
            if (ret.length > 0) {
                return {status: 'OK', pnum: testdata.pnum, data: ret};
            }
            ret = _.where(testdata.list, {
                r: 'OK',
                s: 'F'
            });
            let retf;
            if (ret.length > 0) {
                retf = {
                    status: 'OK',
                    pnum: testdata.pnum,
                    data: [{
                        d: ret[0].d,
                        sn: id,
                        t: 'unknown',
                        st: '',
                        ts: ret[0].ts,
                        s: 'F',
                        r: 'OK'
                    }]
                };
            } else {
                retf = {
                    status: 'OK',
                    pnum: testdata.pnum,
                    data: testdata.list[testdata.list.length - 1].t
                };
            }
            return retf;
        }
    },

    getEyeImages: function (code) {
        check(code, String);
        ScesDomains.isLoggedIn(this.userId);
        return SyncFiles.find({
            code: code
        }, {
            sort: {
                dateCreated: -1
            },
            limit: 200
        }).fetch();
    },

    getSensitivityData: function (code) {
        check(code, String);
        ScesDomains.isLoggedIn(this.userId);
        let testdata = Testdata.find({
            'device.SerialNumber': code,
            'type': 'rxtests',
            'subtype': 'sensitivity'
        }, {
            fields: {
                'meta.Channel': 1,
                'meta.SetVoltage': 1,
                'meta.SetTemperature_C': 1,
                'data.RawData': 1,
                'data.RSquared': 1,
                'data.Cwdm4ExtraploatedOma': 1,
                'timestamp': 1
            }
        });
        return testdata.fetch();
    }
});

Meteor.publish('reworkCodes', function (options, search, filter) {
    ScesDomains.getUser(this.userId);
    return ReworkCode.find();
});

function _returnSummary (summ) {
    let ret = [];
    let fts = summ.tstparams.length > 0 ? summ.tstparams : summ.tsts;
    _.each(fts, (tstparam) => {
        let obj = {};
        let tstp = tstparam.split(' - ');
        obj.d = summ.timestamp;
        obj.sn = summ.sn;
        obj.t = tstp[0];
        obj.st = tstp[1];
        obj.param = tstp[2] || '';
        obj.ts = summ.timestamp;
        obj.s = summ.status;
        obj.r = 'ERR';
        ret.push(obj);
    });
    return ret;
}

function getTosas () {
    let tosas = [
        '15412195',
        '15485226',
        '16126614',
        '16125687',
        '16128096',
        '16125318',
        '16126331',
        '16113091',
        '16124701',
        '16125272',
        '16125231',
        '16113838',
        '16125764',
        '16125250',
        '16125773',
        '16126766',
        '16113923',
        '16125057',
        '16125513',
        '16125527',
        '16125381',
        '16128763',
        '16126725',
        '16128353',
        '16126350',
        '16126724',
        '16128767',
        '16126744',
        '16128369',
        '16128370',
        '16125327',
        '16125514',
        '16128221',
        '16125324',
        '16126761',
        '16128230',
        '16125804',
        '16128089',
        '16126769',
        '16125530',
        '16128371',
        '16126738',
        '16114161',
        '16125343',
        '16125788',
        '16128361',
        '16128219',
        '16128228',
        '16125348',
        '16125361',
        '16125365',
        '16125619',
        '16125501',
        '16125649',
        '16125364',
        '16113589',
        '16125643',
        '16125386',
        '16128381',
        '16125339',
        '16128450',
        '16128782',
        '16128152',
        '16125299',
        '16125630',
        '16124669',
        '16114400',
        '16126557',
        '16128391',
        '16114275',
        '16128423',
        '16125481',
        '16125547',
        '16128519',
        '16128495',
        '16128478',
        '16125296',
        '16128301',
        '16126612',
        '16125488',
        '16128379',
        '16125617',
        '16126723',
        '16125298',
        '16125618',
        '16125341',
        '16125336',
        '16125352',
        '16125536',
        '16125294',
        '16125506',
        '16126376',
        '16128401',
        '16126385',
        '16125307',
        '16125623',
        '16128099',
        '16128299',
        '16125752',
        '16125606',
        '16128484',
        '16125591',
        '16128764',
        '16125301',
        '16125806',
        '16125786',
        '16125633',
        '16126737',
        '16125359',
        '16125314',
        '16128136',
        '16128355',
        '16128376',
        '16128396',
        '16113294',
        '16114447',
        '16128377',
        '16128398',
        '16128114',
        '16128385',
        '16128418',
        '16126585',
        '16114462',
        '16125337',
        '16125540',
        '16126621',
        '16125495',
        '16126566',
        '16126788',
        '16125528',
        '16125538',
        '16126758',
        '16125490',
        '16126623',
        '16126635',
        '16126594',
        '16126465',
        '16125646',
        '16126563',
        '16126400',
        '16125472',
        '16126802',
        '16113746',
        '16126561',
        '16125014',
        '16125385',
        '16126338',
        '16125496',
        '16125222',
        '16125235',
        '16126608',
        '16126627',
        '16126555',
        '16125774',
        '16126580',
        '16126593',
        '16125510',
        '16128416',
        '16126803',
        '16126571',
        '16126294',
        '16126808',
        '16126464',
        '16126433',
        '16125209',
        '16114439',
        '16126455',
        '16126607',
        '16126578',
        '16124697',
        '16125478',
        '16126581',
        '16126806',
        '16114179',
        '16128414',
        '16128111',
        '16113583',
        '16114092',
        '16125236',
        '16125797',
        '16124965',
        '16128131',
        '16128472',
        '16125257',
        '16125002',
        '16114433',
        '16125810',
        '16126342',
        '16125355',
        '16128116',
        '16126772',
        '16125736',
        '16125230',
        '16128247',
        '16114006',
        '16125316',
        '16125789',
        '16128135',
        '16128115',
        '16125800',
        '16125578',
        '16125827',
        '16126759',
        '16125256',
        '16128242',
        '16125744',
        '16125305',
        '16126792',
        '16126807',
        '16126787',
        '16126804',
        '16128095',
        '16128241',
        '16125776',
        '16125817',
        '16125290',
        '16125785',
        '16128272',
        '16126773',
        '16128457',
        '16113691',
        '16128150',
        '16126793',
        '16128153',
        '16128109',
        '16128117',
        '16128137',
        '16128094',
        '16125604',
        '16128274',
        '16128279',
        '16128138',
        '16125799',
        '16128113',
        '16128310',
        '16128316',
        '16128098',
        '16125775',
        '16125807',
        '16125803',
        '16125826',
        '16128245',
        '16125796',
        '16128270',
        '16125777',
        '16125816',
        '16126736',
        '16114560',
        '16128419',
        '16128311',
        '16128130',
        '16126749',
        '16126800',
        '16126746',
        '16128380',
        '16128793',
        '16126732',
        '16126760',
        '16128792',
        '16128220',
        '16125505',
        '16126789',
        '16125484',
        '16128411',
        '16128784',
        '16125566',
        '16128797',
        '16126721',
        '16125790',
        '16113781',
        '16128222',
        '16128218',
        '16125517',
        '16125761',
        '16126805',
        '16126801',
        '16126763',
        '16125635',
        '16126750',
        '16128268',
        '16126467',
        '16126734',
        '16125802',
        '16126774',
        '16114488',
        '16128112',
        '16125491',
        '16128210',
        '16128231',
        '16128208',
        '16128227',
        '16128791',
        '16114522',
        '16128308',
        '16126733',
        '16126463',
        '16128309',
        '16128412',
        '16124902',
        '16124876',
        '16113250',
        '16113148',
        '16070124',
        '16113256',
        '16113225',
        '16105371',
        '16113285',
        '16054048',
        '16065627',
        '16113177',
        '16113692',
        '16124898',
        '16113157',
        '16113165',
        '16124926',
        '16113262',
        '16113889',
        '16113211',
        '16124713',
        '16124790',
        '16113214',
        '16114309',
        '16113988',
        '16114015',
        '16114472',
        '16113978',
        '16113592',
        '16114019',
        '16113259',
        '16124894',
        '16124887',
        '16114052',
        '16113963',
        '16113829',
        '16114014',
        '16124928',
        '16113146',
        '16124872',
        '16053075',
        '16113566',
        '16124886',
        '16114010',
        '16084221',
        '16124855',
        '16113252',
        '16124915',
        '16124879',
        '16113151',
        '16113287',
        '16124930',
        '16103335',
        '16104606',
        '16124800',
        '16113234',
        '16113226',
        '16105933',
        '16113960',
        '16114023',
        '16114225',
        '16113964',
        '16113897',
        '16125325',
        '16104256',
        '16085962',
        '16113805',
        '16126740',
        '16124858',
        '16113110',
        '16084175',
        '16126589',
        '16085232',
        '16125108',
        '16113198',
        '16124760',
        '16085291',
        '16125308',
        '16062517',
        '16124884',
        '16124780',
        '16114018',
        '16113972',
        '16113121',
        '16113935',
        '16128144',
        '16126786',
        '16128119',
        '16113971',
        '16124754',
        '16125330',
        '16124810',
        '16106184',
        '16125408',
        '16124799',
        '16124896',
        '16113283',
        '16128065',
        '16103253',
        '16025733',
        '16106002',
        '16125323',
        '16125346',
        '16086032',
        '16128121',
        '16104783',
        '16124792',
        '16113119',
        '16125317',
        '16125754',
        '16125311',
        '16103218',
        '16114053',
        '16114031',
        '16124828',
        '16128789',
        '16124826',
        '16113983',
        '16124895',
        '16113894',
        '16128463',
        '16113965',
        '16125479',
        '16125306',
        '16125360',
        '16113976',
        '16114245',
        '16114041',
        '16125309',
        '16124702',
        '16125322',
        '16114129',
        '16126782',
        '16128239',
        '16128087',
        '16128123',
        '16126397',
        '16125448',
        '16105286',
        '16114054',
        '16113432',
        '16103297',
        '16125334',
        '16094179',
        '16125152',
        '16113133',
        '16114272',
        '16128266',
        '16128100',
        '16124819',
        '16128083',
        '16125667',
        '16126196',
        '16128459',
        '16084275',
        '16126420',
        '16128300',
        '16125320',
        '16053998',
        '16128295',
        '16126237',
        '16128067',
        '16126202',
        '16128471',
        '16128429',
        '16128283',
        '16128458',
        '16062794',
        '16125319',
        '16128069',
        '16128102',
        '16027235',
        '16128118',
        '16054212',
        '16125133',
        '16125699',
        '16126369',
        '16128106',
        '16104240',
        '16114595',
        '16126562',
        '16124795',
        '16128442',
        '16095518',
        '16128449',
        '16128554',
        '16128569',
        '16125362',
        '16128078',
        '16128781',
        '16128464',
        '16128126',
        '16114302',
        '16103488',
        '16128252',
        '16128787',
        '16128246',
        '16105387',
        '16128082',
        '16126352',
        '16113901',
        '16103089',
        '16126797',
        '16126781',
        '16126810',
        '16128250',
        '16113007',
        '16126785',
        '16126783',
        '16113063',
        '16114036',
        '16126812',
        '16128129',
        '16128275',
        '16128276',
        '16126799',
        '16126813',
        '16094159',
        '16105078'
    ];
    return tosas;
}

function getRosas () {
    let rosas = [
        'BD01381',
        'BD17080',
        'BD28718',
        'BD30944',
        'BD30953',
        'BD26727',
        'BD24349',
        'BD27275',
        'BD22219',
        'BD23290',
        'BD27406',
        'BD27056',
        'BD24427',
        'BD26737',
        'BD24078',
        'BD22090',
        'BD26728',
        'BD27331',
        'BD22843',
        'BD29190',
        'BD32412',
        'BD23333',
        'BD27323',
        'BD24235',
        'BD32615',
        'BD28171',
        'BD24242',
        'BD28658',
        'BD27213',
        'BD26417',
        'BD31870',
        'BD28227',
        'BD32323',
        'BD28038',
        'BD32407',
        'BD24321',
        'BD23413',
        'BD24193',
        'BD24018',
        'BD24772',
        'BD24017',
        'BD32421',
        'BD27409',
        'BD27316',
        'BD28169',
        'BD32445',
        'BD24441',
        'BD32446',
        'BD32068',
        'BD29959',
        'BD23407',
        'BD23357',
        'BD28168',
        'BD24760',
        'BD24238',
        'BD25947',
        'BD28524',
        'BD24762',
        'BD22193',
        'BD24036',
        'BD32319',
        'BD24764',
        'BD28775',
        'BD24761',
        'BD24247',
        'BD27337',
        'BD32278',
        'BD27530',
        'BD28552',
        'BD27398',
        'BD28659',
        'BD29348',
        'BD30126',
        'BD32273',
        'BD28497',
        'BD29123',
        'BD32317',
        'BD27901',
        'BD28518',
        'BD28768',
        'BD32612',
        'BD24101',
        'BD26961',
        'BD23419',
        'BD26931',
        'BD31523',
        'BD24104',
        'BD32410',
        'BD29610',
        'BD22532',
        'BD28370',
        'BD29354',
        'BD29718',
        'BD31058',
        'BD27972',
        'BD27328',
        'BD23403',
        'BD24770',
        'BD22407',
        'BD27580',
        'BD30501',
        'BD23358',
        'BD31520',
        'BD22340',
        'BD23930',
        'BD24237',
        'BD27942',
        'BD28036',
        'BD28023',
        'BD30493',
        'BD23420',
        'BD22099',
        'BD27962',
        'BD28939',
        'BD28706',
        'BD31015',
        'BD28757',
        'BD27295',
        'BD23365',
        'BD32438',
        'BD31436',
        'BD29722',
        'BD28281',
        'BD23366',
        'BD29721',
        'BD28489',
        'BD29605',
        'BD28492',
        'BD28774',
        'BD28494',
        'BD28379',
        'BD28789',
        'BD30015',
        'BD28517',
        'BD31895',
        'BD28704',
        'BD22544',
        'BD32456',
        'BD29719',
        'BD29999',
        'BD29613',
        'BD28537',
        'BD29614',
        'BD32573',
        'BD28025',
        'BD32622',
        'BD24636',
        'BD25948',
        'BD24328',
        'BD29125',
        'BD26316',
        'BD24169',
        'BD28028',
        'BD27583',
        'BD24768',
        'BD24771',
        'BD24763',
        'BD28603',
        'BD28588',
        'BD29356',
        'BD30131',
        'BD29113',
        'BD29363',
        'BD28790',
        'BD24251',
        'BD24322',
        'BD30138',
        'BD22092',
        'BD32414',
        'BD29616',
        'BD29617',
        'BD26320',
        'BD28375',
        'BD26974',
        'BD27336',
        'BD32571',
        'BD27429',
        'BD24197',
        'BD22103',
        'BD32181',
        'BD26732',
        'BD32566',
        'BD26970',
        'BD28037',
        'BD28915',
        'BD29606',
        'BD30830',
        'BD24190',
        'BD28545',
        'BD32423',
        'BD29114',
        'BD31017',
        'BD27324',
        'BD20781',
        'BD23372',
        'BD30829',
        'BD26522',
        'BD29734',
        'BD24499',
        'BD28466',
        'BD27354',
        'BD25946',
        'BD28372',
        'BD24413',
        'BD23385',
        'BD26443',
        'BD28200',
        'BD29352',
        'BD29609',
        'BD28702',
        'BD30013',
        'BD32184',
        'BD31011',
        'BD27964',
        'BD26725',
        'BD29603',
        'BD22310',
        'BD26437',
        'BD23719',
        'BD27777',
        'BD28550',
        'BD32579',
        'BD30300',
        'BD24191',
        'BD32570',
        'BD32578',
        'BD32183',
        'BD32575',
        'BD27012',
        'BD32192',
        'BD30946',
        'BD29419',
        'BD31028',
        'BD32569',
        'BD29728',
        'BD32420',
        'BD32567',
        'BD32416',
        'BD27014',
        'BD26622',
        'BD31060',
        'BD30956',
        'BD22543',
        'BD22559',
        'BD30947',
        'BD32418',
        'BD30492',
        'BD27017',
        'BD29967',
        'BD30933',
        'BD30871',
        'BD26309',
        'BD23450',
        'BD22409',
        'BD31026',
        'BD30384',
        'BD27624',
        'BD32327',
        'BD27232',
        'BD30499',
        'BD23359',
        'BD29733',
        'BD22221',
        'BD29347',
        'BD28724',
        'BD27605',
        'BD22231',
        'BD30486',
        'BD30491',
        'BD29997',
        'BD30873',
        'BD29963',
        'BD29729',
        'BD26439',
        'BD30494',
        'BD30276',
        'BD27350',
        'BD30942',
        'BD27346',
        'BD27015',
        'BD24497',
        'BD29972',
        'BD28587',
        'BD22545',
        'BD29962',
        'BD28487',
        'BD24187',
        'BD28486',
        'BD30495',
        'BD27449',
        'BD24198',
        'BD30490',
        'BD27753',
        'BD30940',
        'BD23414',
        'BD27945',
        'BD24444',
        'BD30586',
        'BD31880',
        'BD30746',
        'BD31163',
        'BD31126',
        'BD26740',
        'BD31865',
        'BD23384',
        'BD31021',
        'BD28617',
        'BD27768',
        'BD31067',
        'BD28626',
        'BD30372',
        'BD31897',
        'BD31762',
        'BD30164',
        'BD31127',
        'BD27525',
        'BD27793',
        'BD31027',
        'BD28303',
        'BD28925',
        'BD31770',
        'BD32259',
        'BD33030',
        'BD28635',
        'BD28002',
        'BD30756',
        'BD30742',
        'BD30667',
        'BD31120',
        'BD31871',
        'BD26936',
        'BD31020',
        'BD31861',
        'BD32127',
        'BD31034',
        'BD26942',
        'BD31121',
        'BD27728',
        'BD27345',
        'BD30821',
        'BD28633',
        'BD31898',
        'BD30695',
        'BD30968',
        'BD31885',
        'BD30368',
        'BD31758',
        'BD28310',
        'BD31024',
        'BD31761',
        'BD26920',
        'BD27020',
        'BD26123',
        'BD31101',
        'BD33443',
        'BD27000',
        'BD33277',
        'BD33027',
        'BD26507',
        'BD30762',
        'BD32595',
        'BD26065',
        'BD25719',
        'BD26133',
        'BD31050',
        'BD31902',
        'BD30753',
        'BD32288',
        'BD33444',
        'BD25721',
        'BD32601',
        'BD27385',
        'BD33018',
        'BD26122',
        'BD31066',
        'BD31852',
        'BD28290',
        'BD28620',
        'BD26610',
        'BD25945',
        'BD33023',
        'BD31199',
        'BD32530',
        'BD31114',
        'BD32526',
        'BD30820',
        'BD26140',
        'BD32510',
        'BD32255',
        'BD31063',
        'BD32398',
        'BD26878',
        'BD25944',
        'BD26879',
        'BD28629',
        'BD31867',
        'BD28627A',
        'BD31102',
        'BD33273',
        'BD33292',
        'BD32655',
        'BD32532',
        'BD32603',
        'BD27001',
        'BD26880',
        'BD31035',
        'BD30416',
        'BD33445',
        'BD30616',
        'BD31125',
        'BD31202',
        'BD31833',
        'BD26935',
        'BD26132',
        'BD27531',
        'BD33279',
        'BD32211',
        'BD31054',
        'BD31838',
        'BD32311',
        'BD28309',
        'BD31105',
        'BD31500',
        'BD32267',
        'BD32316',
        'BD30888',
        'BD29960',
        'BD30757',
        'BD31040',
        'BD30803',
        'BD31769',
        'BD31872',
        'BD31116',
        'BD32505',
        'BD32309',
        'BD31119',
        'BD27919',
        'BD26134',
        'BD31057',
        'BD31866',
        'BD31813',
        'BD27770',
        'BD27788',
        'BD28293',
        'BD26255',
        'BD31022',
        'BD32283',
        'BD28616',
        'BD31104',
        'BD28295',
        'BD31857',
        'BD31763',
        'BD28301',
        'BD32596',
        'BD31195',
        'BD30893',
        'BD27447',
        'BD31075',
        'BD31077',
        'BD30894',
        'BD31822',
        'BD31115',
        'BD31778',
        'BD31200',
        'BD31033',
        'BD27006',
        'BD33281',
        'BD32300',
        'BD30461',
        'BD26131',
        'BD31092',
        'BD28308',
        'BD32531',
        'BD27347',
        'BD27432',
        'BD32154',
        'BD31109',
        'BD27685',
        'BD27351',
        'BD25655',
        'BD28300',
        'BD31860',
        'BD31818',
        'BD31106',
        'BD31828',
        'BD33275',
        'BD32560',
        'BD31025',
        'BD31079',
        'BD30747',
        'BD26781',
        'BD26142',
        'BD32305',
        'BD32662',
        'BD32301',
        'BD30482',
        'BD27016',
        'BD26141',
        'BD25780',
        'BD32529',
        'BD26138',
        'BD32591',
        'BD26136',
        'BD30884',
        'BD32602',
        'BD33020',
        'BD32145',
        'BD26999',
        'BD27018',
        'BD26139',
        'BD32543',
        'BD32129',
        'BD32597',
        'BD32275',
        'BD32594',
        'BD29500',
        'BD32394'
    ];
    return rosas;
}

function noShip () {
    let sns = [
        'kd60401005',
        'kd60525082',
        'kd60523235',
        'kd60511319',
        'kd60517121',
        'kd60506101',
        'kd60510291',
        'kd60221003',
        'kd60212198',
        'kd60221076',
        'kd60407016',
        'kd60510115',
        'kd60525064',
        'kd60509106',
        'kd60525057',
        'kd60525086',
        'kd60525163',
        'kd60523306',
        'kd60506213',
        'kd60518045',
        'kd60523100',
        'kd60523337',
        'kd60525075',
        'kd60512229',
        'kd60518031',
        'kd60525071',
        'kd60511255',
        'kd60512223',
        'kd60525172',
        'kd60510186',
        'kd60518002',
        'kd60516117',
        'kd60516054',
        'kd60523121',
        'kd60523237',
        'kd60519300',
        'kd60519378',
        'kd60519114',
        'kd60517228',
        'kd60516124',
        'kd60519347',
        'kd60519258',
        'kd60518013',
        'kd60518041',
        'kd60516122',
        'kd60517093',
        'kd60519080',
        'kd60519477',
        'kd60511165',
        'kd60511292',
        'kd60511428',
        'kd60519053',
        'kd60519148',
        'kd60517009',
        'kd60512271',
        'kd60512057',
        'kd60512007',
        'kd60512056',
        'kd60407014',
        'kd60523392',
        'kd60523376',
        'kd60516053',
        'kd60516037',
        'kd60517276',
        'kd60525058',
        'kd60511462',
        'kd60425158',
        'kd60407015',
        'kd60516021',
        'kd60516070',
        'kd60525177',
        'kd60511467',
        'kd60407020',
        'kd60510283',
        'kd60510360',
        'kd60510198',
        'kd60510293',
        'kd60510161',
        'kd60511020',
        'kd60407006',
        'kd60427039',
        'kd60407188',
        'kd51124172',
        'kd60221142',
        'kd60303288',
        'kd60525108',
        'kd51116013',
        'kd60406547',
        'kd51113201',
        'kd51121096',
        'kd60511087',
        'kd60511021',
        'kd60511051',
        'kd60511282',
        'kd60407019',
        'kd60525074',
        'kd60407026',
        'kd60407013',
        'kd60517314',
        'kd60525061',
        'kd60525080',
        'kd60519028',
        'kd60512326',
        'kd60525103',
        'kd60512333',
        'kd60511406',
        'kd60512177',
        'kd60525098',
        'kd60517263',
        'kd60517053',
        'kd60511371',
        'kd60512396',
        'kd60511228',
        'kd60512109',
        'kd60512311',
        'kd60511237',
        'kd60511157',
        'kd60511014',
        'kd60511095',
        'kd60511154',
        'kd60511464',
        'kd60511421',
        'kd60511433',
        'kd60510310',
        'kd60509393',
        'kd60511322',
        'kd60506125',
        'kd60427065',
        'kd60427113',
        'kd60427070',
        'kd60427323',
        'kd60427054',
        'kd60427034',
        'kd60427076',
        'kd60509030',
        'kd60506211',
        'kd60509017',
        'kd60509050',
        'kd60506157',
        'kd60506233',
        'kd60506104',
        'kd60506113',
        'kd60506139',
        'kd60506116',
        'kd60506080',
        'kd60506178',
        'kd60509053',
        'kd60509075',
        'kd60509063',
        'kd60509078',
        'kd60509367',
        'kd60509380',
        'kd60509317',
        'kd60509351',
        'kd60509320',
        'kd60509237',
        'kd60509353',
        'kd60506041',
        'kd60509253',
        'kd60509254',
        'kd60509371',
        'kd60509332',
        'kd60509258',
        'kd60509298',
        'kd60509299',
        'kd60509289',
        'kd60120200',
        'kd60509145',
        'kd60509126',
        'kd60509113',
        'kd60509302',
        'kd60509250',
        'kd60509246',
        'kd60509293',
        'kd60509167',
        'kd60509134',
        'kd60509312',
        'kd60509285',
        'kd60510052',
        'kd60511460',
        'kd60510110',
        'kd60510276',
        'kd60519582',
        'kd60519474',
        'kd60519468',
        'kd60519369',
        'kd60519392',
        'kd60523091',
        'kd60523029',
        'kd60523159',
        'kd60523025',
        'kd60523038',
        'kd60523367',
        'kd60523187',
        'kd60523176',
        'kd60523272',
        'kd60523284',
        'kd60523082',
        'kd60523040',
        'kd60523080',
        'kd60523274',
        'kd60523378',
        'kd60523378',
        'kd60523185',
        'kd60523267',
        'kd60523322',
        'kd60523394',
        'kd60523351',
        'kd60523162',
        'kd60523257',
        'kd60523234',
        'kd60523262',
        'kd60523200',
        'kd60523302',
        'kd60519144',
        'kd60519191',
        'kd60519111',
        'kd60519119',
        'kd60519096',
        'kd60519482',
        'kd60519432',
        'kd60519210',
        'kd60519538',
        'kd60519548',
        'kd60519547',
        'kd60519024',
        'kd60519175',
        'kd60519194',
        'kd60519105',
        'kd60519215',
        'kd60519461',
        'kd60519501',
        'kd60523398',
        'kd60523312',
        'kd60523325',
        'kd60523258',
        'kd60523344',
        'kd60519567',
        'kd60519348',
        'kd60523001',
        'kd60523244',
        'kd60519298',
        'kd60519493',
        'kd60519384',
        'kd60519352',
        'kd60519524',
        'kd60602219',
        'kd60602142',
        'kd60602362',
        'kd60602399',
        'kd60602201',
        'kd60603212',
        'kd60602206',
        'kd60602174',
        'kd60602163',
        'kd60602154',
        'kd60602167',
        'kd60603139',
        'kd60603229',
        'kd60602054',
        'kd60602026',
        'kd60602190',
        'kd60602159',
        'kd60602172',
        'kd60602173',
        'kd60602309',
        'kd60602022',
        'kd60602361',
        'kd60603007',
        'kd60602269',
        'kd60602185',
        'kd60602127',
        'kd60603076',
        'kd60603356',
        'kd60606015',
        'kd60606009',
        'kd60603123',
        'kd60603127',
        'kd60603316',
        'kd60603138',
        'kd60603014',
        'kd60603013',
        'kd60603180',
        'kd60603121',
        'kd60603278',
        'kd60606387',
        'kd60525006',
        'kd60525025',
        'kd60517202',
        'kd60517339',
        'kd60517184',
        'kd60606175',
        'kd60603096',
        'kd60606174',
        'kd60517323',
        'kd60525015',
        'kd60525132',
        'kd60525048',
        'kd60525023',
        'kd60518060',
        'kd60525141',
        'kd60525014',
        'kd60525007',
        'kd60525159',
        'kd60518062',
        'kd60606318',
        'kd60606246',
        'kd60606294',
        'kd60525033',
        'kd60606376',
        'kd60517157',
        'kd60517318',
        'kd60606400',
        'kd60606253',
        'kd60606095',
        'kd60606050',
        'kd60606141',
        'kd60606260',
        'kd60606068',
        'kd60606044',
        'kd60606047',
        'kd60517330',
        'kd60525053',
        'kd60517164',
        'kd60518004',
        'kd60517153',
        'kd60526015',
        'kd60527089',
        'kd60607155',
        'kd60526016',
        'kd60512237',
        'kd60525047',
        'kd60525029',
        'kd60525026',
        'kd60527301',
        'kd60527137',
        'kd60527177',
        'kd60526010',
        'kd60527111',
        'kd60527211',
        'kd60527118',
        'kd60526012',
        'kd60531308',
        'kd60531379',
        'kd60531303',
        'kd60531295',
        'kd60527002',
        'kd60601397',
        'kd60527019',
        'kd60531310',
        'kd60531345',
        'kd60531343',
        'kd60527022',
        'kd60601169',
        'kd60601182',
        'kd60527237',
        'kd60531374',
        'kd60531283',
        'kd60527093',
        'kd60527070',
        'kd60527076',
        'kd60527084',
        'kd60527065',
        'kd60527266',
        'kd60531366',
        'kd60527240',
        'kd60527031',
        'kd60601180',
        'kd60527114',
        'kd60527064',
        'kd60527044',
        'kd60527054',
        'kd60527013',
        'kd60527010',
        'kd60531317',
        'kd60531359',
        'kd60531318',
        'kd60531356',
        'kd60531381',
        'kd60531398',
        'kd60601124',
        'kd60601316',
        'kd60602293',
        'kd60601360',
        'kd60601347',
        'kd60601354',
        'kd60601352',
        'kd60601127',
        'kd60601147',
        'kd60601214',
        'kd60601395',
        'kd60601312',
        'kd60601367',
        'kd60601223',
        'kd60601344',
        'kd60601202',
        'kd60601332',
        'kd60601324',
        'kd60602083',
        'kd60602115',
        'kd60602123',
        'kd60602334',
        'kd60601372',
        'kd60602261',
        'kd60602256',
        'kd60602251'
    ];
    return sns;
}
