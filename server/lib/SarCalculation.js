// Extra variables calculation

SarCalculation = {

    sns: {},

    init: function () {
        SarCalculation.sns = {};
    },

    add: function (row) {
        // pm2PwrRawDelta_indBm
        if (row.data.pm2PwrRaw && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'txtpm2', row.data.pm2PwrRaw, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.Pm2PwrRaw && row.t === 'txsetups' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'txspm2', row.data.Pm2PwrRaw, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // CalculatedAPCSetpoint
        if (row.data.MpdSetPoint && row.t === 'txtests' && row.s === 'channeldata' && row.tmpr === 0) {
            this.prepare(row.sn, row.mid, 'mpd0', row.data.MpdSetPoint, '', row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'dt0', row.data.DeviceTemperature_in_C, '', row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.MpdSetPoint && row.t === 'txtests' && row.s === 'channeldata' && row.tmpr === 40) {
            this.prepare(row.sn, row.mid, 'mpd40', row.data.MpdSetPoint, '', row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'dt40', row.data.DeviceTemperature_in_C, '', row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.MpdSetPoint && row.t === 'txtests' && row.s === 'channeldata' && row.tmpr === 70) {
            this.prepare(row.sn, row.mid, 'mpd70', row.data.MpdSetPoint, '', row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'dt70', row.data.DeviceTemperature_in_C, '', row.channel, row.volt, 'txtests', 'channeldata');
        }
        // IdacDelta_inPercentage
        if (row.data.I_DC_DAC_Set && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'idcset', row.data.I_DC_DAC_Set, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.Idc && row.t === 'txsetups' && row.s === 'apctarget') {
            this.prepare(row.sn, row.mid, 'idc', row.data.Idc, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // IdacDelta
        if (row.data.I_DC_DAC_Set && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'idc1set', row.data.I_DC_DAC_Set, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.Idc && row.t === 'txsetups' && row.s === 'apctarget') {
            this.prepare(row.sn, row.mid, 'idc1', row.data.Idc, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // ImodDelta
        if (row.data.MOD_Bias_DAC_Set && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'imodset', row.data.MOD_Bias_DAC_Set, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.Imod && row.t === 'txsetups' && row.s === 'apctarget') {
            this.prepare(row.sn, row.mid, 'imod', row.data.Imod, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // PavgDelta
        if (row.data.Pavg_in_dBm && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'pavgset', row.data.Pavg_in_dBm, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.Pavg_in_dBm && row.t === 'txsetups' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'pavg', row.data.Pavg_in_dBm, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // OMADelta
        if (row.data.OMA_in_dBm && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'omaset', row.data.OMA_in_dBm, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.OMA_in_dBm && row.t === 'txsetups' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'oma', row.data.OMA_in_dBm, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // MaskMarginDelta
        if (row.data.CwdmMaskMargin && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'mmset', row.data.CwdmMaskMargin, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        if (row.data.MaskMargin && row.t === 'txsetups' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'mm', row.data.MaskMargin, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }

        // Temp_delta_in_C
        if (row.data.DeviceTemperature_in_C !== undefined && row.tmpr !== undefined && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'devtemp', row.data.DeviceTemperature_in_C, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'settemp', row.tmpr, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // Vol_delta_in_V
        if (row.data.MsaVcc !== undefined && row.volt !== undefined && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'msavcc', row.data.MsaVcc, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'setvolt', row.volt, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // TxPower_delta_in_dB
        if (row.data.Pavg_in_dBm !== undefined && row.data.MsaTxPWR !== undefined && row.t === 'txtests' && row.s === 'channeldata') {
            this.prepare(row.sn, row.mid, 'pavgindbm', row.data.Pavg_in_dBm, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
            this.prepare(row.sn, row.mid, 'msatxpwr', row.data.MsaTxPWR, row.tmpr, row.channel, row.volt, 'txtests', 'channeldata');
        }
        // RxPower1_delta_in_dB
        if (row.data.RefTxPwrDbm1 !== undefined && row.data.DutRxPwrDbm1 !== undefined && row.t === 'rxtests' && row.s === 'checkmsarxpwr') {
            this.prepare(row.sn, row.mid, 'RefTxPwrDbm1', row.data.RefTxPwrDbm1, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
            this.prepare(row.sn, row.mid, 'DutRxPwrDbm1', row.data.DutRxPwrDbm1, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
        }
        // RxPower2_delta_in_dB
        if (row.data.RefTxPwrDbm2 !== undefined && row.data.DutRxPwrDbm2 !== undefined && row.t === 'rxtests' && row.s === 'checkmsarxpwr') {
            this.prepare(row.sn, row.mid, 'RefTxPwrDbm2', row.data.RefTxPwrDbm2, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
            this.prepare(row.sn, row.mid, 'DutRxPwrDbm2', row.data.DutRxPwrDbm2, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
        }
        // RxPower3_delta_in_dB
        if (row.data.RefTxPwrDbm3 !== undefined && row.data.DutRxPwrDbm3 !== undefined && row.t === 'rxtests' && row.s === 'checkmsarxpwr') {
            this.prepare(row.sn, row.mid, 'RefTxPwrDbm3', row.data.RefTxPwrDbm3, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
            this.prepare(row.sn, row.mid, 'DutRxPwrDbm3', row.data.DutRxPwrDbm3, row.tmpr, row.channel, row.volt, 'rxtests', 'checkmsarxpwr');
        }
        // R2_sens
        if (row.data.RawData !== undefined && row.data.RawData.length > 0 && row.t === 'rxtests' && row.s === 'sensitivity') {
            this.prepare(row.sn, row.mid, 'RawDataSensitivity', row.data.RawData, row.tmpr, row.channel, row.volt, 'rxtests', 'sensitivity');
        }
    },

    execute: function () {
        for (let tst in SarCalculation.sns) {
            let ts = tst.split('|');
            for (let sn in SarCalculation.sns[tst]) {
                let objs = _.where(SarCalculation.sns[tst][sn], {tmpr: ''});
                let procs = _.difference(SarCalculation.sns[tst][sn], objs);
                _.each(procs, (proc) => {
                    let query = {
                        'device.SerialNumber': sn,
                        mid: ts[2],
                        type: ts[0],
                        subtype: ts[1],
                        'meta.Channel': proc.channel,
                        'meta.SetTemperature_C': proc.tmpr

                    };
                    let set = {$set: {}};
                    let hasUpdate = false;
                    // pm2PwrRawDelta_indBm
                    if (proc.txspm2 !== undefined && proc.txtpm2 !== undefined && !_.isNaN(proc.txspm2) && !_.isNaN(proc.txtpm2)) {
                        set.$set['data.pm2PwrRawDelta_indBm'] = proc.txtpm2 - proc.txspm2;
                        hasUpdate = true;
                    }
                    // IdacDelta_inPercentage
                    if (proc.idc !== undefined && proc.idcset !== undefined && !_.isNaN(proc.idc) && !_.isNaN(proc.idcset) && proc.idc !== 0) {
                        set.$set['data.IdacDelta_inPercentage'] = 100 * (proc.idc - proc.idcset) / proc.idc;
                        hasUpdate = true;
                    }

                    // IdacDelta_inPercentage
                    if (proc.idc !== undefined && proc.idcset !== undefined && !_.isNaN(proc.idc) && !_.isNaN(proc.idcset) && proc.idc !== 0) {
                        set.$set['data.IdacDelta_inPercentage'] = 100 * (proc.idc - proc.idcset) / proc.idc;
                        hasUpdate = true;
                    }

                    // IdacDelta
                    if (proc.idc1 !== undefined && proc.idc1set !== undefined && !_.isNaN(proc.idc1) && !_.isNaN(proc.idc1set) && proc.idc1 !== 0) {
                        set.$set['data.IdacDelta'] = proc.idc1 - proc.idc1set;
                        hasUpdate = true;
                    }
                    // ImodDelta
                    if (proc.imod !== undefined && proc.imodset !== undefined && !_.isNaN(proc.imod) && !_.isNaN(proc.imodset) && proc.imod !== 0) {
                        set.$set['data.ImodDelta'] = proc.imod - proc.imodset;
                        hasUpdate = true;
                    }

                    // PavgDelta
                    if (proc.pavg !== undefined && proc.pavgset !== undefined && !_.isNaN(proc.pavg) && !_.isNaN(proc.pavgset) && proc.pavg !== 0) {
                        set.$set['data.PavgDelta'] = proc.pavg - proc.pavgset;
                        hasUpdate = true;
                    }

                    // OMADelta
                    if (proc.oma !== undefined && proc.omaset !== undefined && !_.isNaN(proc.oma) && !_.isNaN(proc.omaset) && proc.oma !== 0) {
                        set.$set['data.OMADelta'] = proc.oma - proc.omaset;
                        hasUpdate = true;
                    }

                    // MaskMarginDelta
                    if (proc.mm !== undefined && proc.mmset !== undefined && !_.isNaN(proc.mm) && !_.isNaN(proc.mmset) && proc.mm !== 0) {
                        set.$set['data.MaskMarginDelta'] = proc.mm - proc.mmset;
                        hasUpdate = true;
                    }

                    // CalculatedAPCSetpoint
                    let obj = _.where(objs, {channel: proc.channel})[0];
                    if (obj && obj.mpd0 !== undefined && obj.mpd40 !== undefined && obj.mpd70 !== undefined && obj.dt0 !== undefined &&
                        obj.dt40 !== undefined && obj.dt70 !== undefined && !_.isNaN(obj.mpd0) && !_.isNaN(obj.mpd40) && !_.isNaN(obj.mpd70)
                        && !_.isNaN(obj.dt0) && !_.isNaN(obj.dt40) && !_.isNaN(obj.dt70)) {
                        switch (proc.tmpr) {
                            case 0:
                                set.$set['data.CalculatedAPCSetpoint'] = obj.mpd0 + obj.dt0 * (obj.mpd40 - obj.mpd0) / 40;
                                break;
                            case 40:
                                if (obj.dt40 < 40) {
                                    set.$set['data.CalculatedAPCSetpoint'] = obj.mpd40 + (obj.dt40 - 40) * (obj.mpd40 - obj.mpd0) / 40;
                                } else {
                                    set.$set['data.CalculatedAPCSetpoint'] = obj.mpd40 + (obj.dt40 - 40) * (obj.mpd70 - obj.mpd40) / 30;
                                }
                                break;
                            case 70:
                                set.$set['data.CalculatedAPCSetpoint'] = obj.mpd70 + (obj.dt70 - 70) * (obj.mpd70 - obj.mpd40) / 30;
                                break;
                            default:
                        }
                    }
                    // Temp_delta_in_C
                    if (proc.devtemp !== undefined && proc.settemp !== undefined && !_.isNaN(proc.devtemp) && !_.isNaN(proc.settemp)) {
                        set.$set['data.Temp_delta_in_C'] = proc.settemp - proc.devtemp;
                        hasUpdate = true;
                    }
                    // Vol_delta_in_V
                    if (proc.msavcc !== undefined && proc.setvolt !== undefined && !_.isNaN(proc.msavcc) && !_.isNaN(proc.setvolt) && proc.setvolt != 0) {
                        set.$set['data.Vol_delta_in_Perc'] = 100 * (proc.setvolt - proc.msavcc / 10000) / proc.setvolt;
                        hasUpdate = true;
                    }
                    // TxPower_delta_in_dB
                    if (proc.pavgindbm !== undefined && proc.msatxpwr !== undefined && !_.isNaN(proc.pavgindbm) && !_.isNaN(proc.msatxpwr)) {
                        set.$set['data.TxPower_delta_in_dB'] = proc.pavgindbm - 10 * Math.log10(proc.msatxpwr / 10000);
                        hasUpdate = true;
                    }
                    // RxPower1_delta_in_dB
                    if (proc.RefTxPwrDbm1 !== undefined && proc.DutRxPwrDbm1 !== undefined && !_.isNaN(proc.RefTxPwrDbm1) && !_.isNaN(proc.DutRxPwrDbm1)) {
                        set.$set['data.RxPower1_delta_in_dB'] = proc.RefTxPwrDbm1 - proc.DutRxPwrDbm1;
                        hasUpdate = true;
                    }
                    // RxPower2_delta_in_dB
                    if (proc.RefTxPwrDbm2 !== undefined && proc.DutRxPwrDbm2 !== undefined && !_.isNaN(proc.RefTxPwrDbm2) && !_.isNaN(proc.DutRxPwrDbm2)) {
                        set.$set['data.RxPower2_delta_in_dB'] = proc.RefTxPwrDbm2 - proc.DutRxPwrDbm2;
                        hasUpdate = true;
                    }
                    // RxPower3_delta_in_dB
                    if (proc.RefTxPwrDbm3 !== undefined && proc.DutRxPwrDbm3 !== undefined && !_.isNaN(proc.RefTxPwrDbm3) && !_.isNaN(proc.DutRxPwrDbm3)) {
                        set.$set['data.RxPower3_delta_in_dB'] = proc.RefTxPwrDbm3 - proc.DutRxPwrDbm3;
                        hasUpdate = true;
                    }
                    // R2_sens
                    if (proc.RawDataSensitivity !== undefined && proc.RawDataSensitivity.length > 0) {
                        // Frist try linear fit
                        let xArr = [];
                        let yArr = [];
                        _.each(proc.RawDataSensitivity, (sens) => {
                            if (sens.Q <= -0.60206 && sens.Q >= -1) {
                                xArr.push(sens.Oma);
                                yArr.push(sens.Q);
                            }
                        });

                        let regression = Meteor.linearRegression(xArr, yArr);
                        let rSquared = regression.rSquared;
                        if (rSquared > 0.98) {
                            set.$set['data.R2_sens'] = rSquared;
                            set.$set['data.CWDM4_sens'] = regression.evaluateX([-0.63357])[0];
                            set.$set['data.CWDM4_sens_alt1'] = regression.evaluateX([-0.67004])[0];
                            set.$set['data.CLR4'] = regression.evaluateX([-1.07918])[0];
                            set.$set['data.CurveFitMethod'] = 'Linear_Fit';
                            hasUpdate = true;
                        } else {
                            // ERFC curve fit since linear fit had too great an R_squared
                            let exec = require('child-process-promise').exec;
                            let Fiber = require('fibers');
                            let Future = require('fibers/future');

                            let connectionString = process.env.MONGO_URL.replace('sslVerifyCertificate=false', 'ssl_cert_reqs=CERT_NONE');

                            let scriptExecution = 'python '.concat(Assets.absoluteFilePath('python/curveFit.py'), ' ', xArr.toString(), ' ', yArr.toString(), ' "',
                                connectionString, '" ', ts[2], ' ', ts[0], ' ', ts[1], ' ', proc.channel, ' ', proc.tmpr);

                            let future = new Future();
                            new Fiber(function () {
                                exec(scriptExecution).then(function (result) {
                                    if (result.stderr) {
                                        future.return('stderr: '.concat(result.stderr));
                                    } else {
                                        future.return('stdout: '.concat(result.stdout));
                                    }
                                }).catch(function (err) {
                                    future.return('ERROR: '.concat(err.toString()));
                                });
                            }).run();

                            let ret = future.wait();
                            console.log(sn.concat(' completed R2 python script: ', ret));
                        }
                    }

                    // console.log(JSON.stringify(query));
                    // console.log(JSON.stringify(set));

                    if (hasUpdate === true) {
                        Testdata.update(query, set, {multi: true});
                    }
                });
            }
        }
    },

    prepare: function (sn, mid, param, value, tmpr, channel, volt, t, st) {
        if (!SarCalculation.sns[t + '|' + st + '|' + mid]) {
            SarCalculation.sns[t + '|' + st + '|' + mid] = {};
        }
        if (!SarCalculation.sns[t + '|' + st + '|' + mid][sn]) {
            SarCalculation.sns[t + '|' + st + '|' + mid][sn] = [];
        }

        let obj = _.where(this.sns[t + '|' + st + '|' + mid][sn], {tmpr: tmpr, channel: channel})[0];
        if (!obj) {
            obj = {tmpr: tmpr, channel: channel};
            SarCalculation.sns[t + '|' + st + '|' + mid][sn].push(obj);
        }
        obj[param] = value;
    }
};
