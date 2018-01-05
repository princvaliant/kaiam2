

Settings = {
    site: {
        version: '1.5.4',
        title: 'Kaiam corp Dashboard',
        url: 'http://localhost:3000' // *
    },
    verifyEmail: false,
    welcomeEmail: {
        send: false,
        from: 'YOUR NAME - NOTES <YOUR_ADDRESS@YOUR_EMAIL.com>',
        subject: 'Welcome!' //* & edit private/email/welcome-email
    },

    // Timetrend intervals
    intervals: ['UNIQUE', 'H1', 'H8', 'D', 'W'],
    // How many days back for the queryde
    intervalsQuery: {
        UNIQUE: 5,
        H1: 7,
        H8: 21,
        D: 45,
        W: 200
    },
    intervalsSchedule: {
        H1: 'every 59 minutes',
        H8: 'every 10 hours',
        D: 'at 2:30 am',
        W: 'at 2:15 am'
    },

    manufacturers: ['Kaiam', 'Rocket', 'Zytek'],


    processStepColor: {
        'rxtests - rssitest': '#4661EE',
        'rxtests - rxfunctionality': '#0074D9',
        'rxtests - sensitivity': '#22AAFF',
        'rxtests - lostest': '#87CEFF',
        'rxtests - rxamplitude': '#009ACD',
        'rxsetups - rssisetup': '#499DF5',
        'powercheckassembly - assembly': '#FF4136',
        'txsetups - channeldata': '#FF851B',
        'txtests - channeldata': '#EE6363',
        'packout - ': '#AAAAAA',
        'packout - packout': '#AAAAAA',
        'powercalbeforetx - beforetx': '#FFD700',
        'moduletests - msatemp': '#A6D785',
        'rxtests - refPwrCheck': '#009ACD',
        'rxtests - checkmsarxpwr': '#4661EE',
        'functionaltest - rx': '#0094D9',
        'functionaltest - tx': '#0024D9',
        'functionaltest - module': '#22AAFF'
    },

    customColorset: [
        '#4661EE',
        '#1BCDD1',
        '#8FAABB',
        '#B08BEB',
        '#3EA0DD',
        '#F5A52A',
        '#038FAA',
        '#FAA586',
        '#EB8CC6',
        '#EC5657'
    ],

    lossintervals: {
        'INTERVAL_TODAY': 1000,
        'INTERVAL_YESTERDAY': 1001,
        'INTERVAL_BEFORE_YESTERDAY': 1002,
        'INTERVAL_LAST7DAYS': 1007,
        'INTERVAL_LAST30DAYS': 1030,
        'INTERVAL_LAST90DAYS': 1090,
        'INTERVAL_THISWEEK': 0,
        'INTERVAL_LASTWEEK': 1,
        'INTERVAL_2WEEKSAGO': 2,
        'INTERVAL_3WEEKSAGO': 3,
        'INTERVAL_4WEEKSAGO': 4
    },

    //  List of control part names
    controlPartNumbers: [
        'Control_R1_Test_35_Dual.ksc',
        'Control_R2_Test_35_Dual.ksc',
        'Control_R3_Test_35_Dual.ksc',
        'Control_R4_Test_35_Dual.ksc',
        'Control_R5_Test_35_Dual.ksc',
        'Control_R6_Test_35_Dual.ksc',
        'Control_R7_Test_35_Dual.ksc',
        'Control_Test_35.ksc',
        'Control_Test_35_R1.ksc',
        'Control_Test_35_R2.ksc',
        'Control_Test_sub_R1.ksc',
        'Control_Test_sub_R2.ksc',
        'Control_Test_sub_R4.ksc',
        'Control_Test_sub_R5.ksc',
        'Control_Test_sub_R6.ksc',
        'Control_Test_sub_R7.ksc',
        'Eng_GR4_R1_Setup_Test.ksc',
        'Control_Univ_1',
        'Control_Univ_2',
        'Control_Univ_3',
        'Control_Univ_4',
        'Control_Univ_5',
        'Control_Univ_6',
        'Control_Univ_7',
        'Control_Univ_8',
        'Control_Univ_1_DELETED_',
        'Control_Univ_2_DELETED_',
        'Control_Univ_3_DELETED_',
        'Control_Univ_4_DELETED_',
        'Control_Univ_5_DELETED_',
        'Control_Univ_6_DELETED_',
        'Control_Univ_7_DELETED_',
        'Control_Univ_8_DELETED_',
        'Eng_GR4_Control',
        'Eng_LR4',
        'LR4-Rel',
        'MM_DC-Rel',
        'Eng_LR4_Control',
        'Eng_XQX2202',
        'Eng_XQX3200',
        'LR4_Control',
        'LR4_Control2',
        'QSFP_Control',
        'QSFP_Control14',
        'QSFP_Control_DELETED_',
        'QSFP_Control14_DELETED_',
        'LR4-REL2',
        'REL_2500RAD1',
        'FilterL_XQX2502',
        'Eng_XQX2502',
        'Rel_XQX2502',
        'FilterL_XQX2100'
    ],
    racks: ['Rack_1', 'Rack_3', 'Rack_4', 'Rack_5', 'Rack_6', 'Rack_7', 'Rack_8', 'Rack_9', 'Rack_11',
        'DL_ST', 'QSFP-DEV-PC2', 'Production-4', 'Production-4'
    ],
    spcRacks40GB: ['Rack_1', 'Rack_3', 'Rack_4', 'Rack_5', 'Rack_7', 'Rack_8', 'Rack_9'],
    spcRacks100GB: ['Rack21', 'Rack22', 'Rack23', 'Rack24', 'Rack25', 'Rack26', 'Rack27', 'Rack28', 'Rack29',
        'Rack30', 'Rack31', 'Rack32', 'Rack33', 'Rack34', 'Rack35', 'Rack36', 'LV_Rack_01','LV_Rack_02','LV_Rack_03'],
    spcDUT40GB: ['1A', '1B', '2A', '2B', '3A', '3B'],
    spcDUT100GB: ['Station1', 'Station2', 'Station3', 'Station4'],

    timeTrendShortNames: {
        powercheckassembly: {
            assembly: 'TxTFUNC'
        },
        powercalbeforetx: {
            beforetx: 'TxCAL'
        },
        txsetups: {
            channeldata: 'TxSCD',
            matrix: 'TxSMTX',
            apctarget: 'TxSAPC'
        },
        rxsetups: {
            rssisetup: 'RxSRSSI',
            losssetup: 'RxSLOS',
        },
        txtests: {
            channeldata: 'TxTCD',
            txfunctionality: 'TxTFUNC'
        },
        functionaltest: {
            rx: 'RxTFUNC',
            tx: 'TxTFUNC'
        },
        rxtests: {
            sensitivity: 'RxTSENS',
            rssitest: 'RxTRSSI',
            lostest: 'RxTLOS',
            rxamplitude: 'RxTAMP',
            rxfunctionality: 'RxTFUNC',
            checkmsarxpwr: 'RxPWR',
            overload: 'RxOVRL',
            longdistance: 'RxLNGDST'
        },
        moduletests: {
            msatemp: 'MTMSA',
            vcctest: 'MTVCC',
            power: 'MTPOW'
        },
        actionstatus: {
            error: 'ERR'
        }
    },

    // Fields for SPC charts
    spcData: {
        txtests: {
            channeldata: []
        },
        txsetups: {
            channeldata: []
        },
        rxtests: {
            sensitivity: [],
            rssitest: [],
            lostest: [],
            rxamplitude: []
        },
        calibration: {
            opticalAttenCalChannel: [],
            tp3Prim3CalModule: [],
            tp3PrimeCalChannel: []
        }
    },

    dataURItoBlob: function (dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type: mimeString});
    },


    getTestConfigForPartNumber: function (partNumber) {
        let pnum = PartNumbers.findOne({name: partNumber});
        let device = '';
        if (pnum) {
             device = pnum.device;
        }
        return this.getTestConfigForDevice(device);
    },

    getTestConfigForDevice: function (device) {
        let res = [];
        _.each(_.keys(Settings.testConfig), (key) => {
            _.each(_.keys(Settings.testConfig[key]).sort(), (key2) => {
                let st = Settings.testConfig[key][key2];
                if (st.common !== undefined) {
                    res.push(key + ' - ' + key2);
                } else if (st[device] !== undefined) {
                    res.push(key + ' - ' + key2);
                }
            });
        });
        return res;
    },

    getPartNumbersForDevice: function (device) {
        let res = [];
        let pnums = PartNumbers.find({device: device}).fetch();
        _.each(pnums, (pnum) => {
            if (pnum.device === device || device === '-all-') {
                res.push(pnum.name);
            }
        });
        return res;
    },

    getTestConfigVariablesForPartNumber: function (partNumber, test, subtest, device) {
        let res = [];
        let pnum = PartNumbers.findOne({name: partNumber});
        if (!device && pnum) {
            device = pnum.device;
        }
        _.each(_.keys(Settings.testConfig), (key) => {
            _.each(_.keys(Settings.testConfig[key]).sort(), (key2) => {
                if ((test === '' && subtest === '') || (test === key && subtest === key2)) {
                    let st = Settings.testConfig[key][key2];
                    if (st.common !== undefined) {
                        _.each(st.common, (dt) => {
                            res.push({
                                k: key + ' ' + key2 + ' ' + dt,
                                v: dt,
                                t: Settings.timeTrendShortNames[key] ? Settings.timeTrendShortNames[key][key2] : ''
                            });
                        });
                    }
                    if (st[device] !== undefined) {
                        _.each(st[device], (dt) => {
                            res.push({
                                k: key + ' ' + key2 + ' ' + dt,
                                v: dt,
                                t: Settings.timeTrendShortNames[key] ? Settings.timeTrendShortNames[key][key2] : ''
                            });
                        });
                    }
                }
            });
        });
        return res;
    },

    //  Fields for time trends
    testConfig: {
        powercheckassembly: {
            assembly: {
                '40GB': ['MPDOff', 'MPDOn', 'RSSIOff', 'RSSIOn', 'Log']
            }
        },
        powercalbeforetx: {
            beforetx: {
                '40GB': ['DCAAvgPwrCal', 'DutAvgPwr', 'PMAvgPwr']
            }
        },
        txsetups: {
            channeldata: {
                'common': [
                    'ER_in_dB',
                    'EyeOneLevelPower_in_mW',
                    'EyeZeroLevelPower_in_mW',
                    'I_DC_DAC_Set',
                    'MOD_Bias_DAC_Set',
                    'OMA_in_dBm',
                    'Pavg_in_dBm'

                ],
                '40GB': [
                    'BMON_in_mA',
                    'BMON_Offset',
                    'BMON_Scale',
                    'Mod_Bias_Set_in_mA',
                    'I_DC_Set_in_mA',
                ],
                '100GB': [
                    'PavgAt50mA',
                    'MMAtMax',
                    'MaskMargin',
                    'TotalTimeInSec',
                    'OmaSlope',
                    'PavgSlope',
                    'EyeCaptureFileName',
                    'Pm2PwrRaw',
                    'DcaPwrRaw',
                    'TxPathLoss',
                    'DcaOffset',
                    'RetryCnt',
                    'OmaTarget',
                    'ErTarget',
                    'RMSJitter_in_picoSeconds',
                    'PPJitter_in_picoSeconds',
                    'MPD_Crosstalk',
                    'MsaVcc',
                    'MsaTemp',
                    'MsaTxPWR',
                    'MsaTxPwrScaleLt',
                    'MsaTxPwrScaleMt',
                    'MsaTxPwrScaleHt',
                    'MsaTxPwrOffset',
                    'FwVer',
                    'ModTherm',
                    'RawData'
                ]
            },
            matrix: {
                '40GB': ['PD0Weight', 'PD1Weight', 'PD2Weight', 'PD3Weight']
            },
            apctarget: {
                '100GB': ['Idc', 'Imod', 'Scale', 'Offset', 'TempSpT', 'Mpd', 'ModTherm']
            }
        },
        rxsetups: {
            rssisetup: {
                '40GB': ['Offset', 'Slope']
            },
            losssetup: {
                '40GB': ['Gain4A']
            }
        },
        txtests: {
            channeldata: {
                'common': [
                    'Crossing_in_Percent',
                    'DeviceTemperature_in_C',
                    'Er_in_dB',
                    'EyeHeight_in_dBm',
                    'EyeWidth_in_dBm',
                    'I_DC_DAC_Set',
                    'MOD_Bias_DAC_Set',
                    'MPD_Crosstalk',
                    'OMA_in_dBm',
                    'Pavg_in_dBm',
                    'PPJitter_in_picoSeconds',
                    'RMSJitter_in_picoSeconds'
                ],
                '40GB': [
                    'EyeOneLevelPower_in_mW',
                    'EyeZeroLevelPower_in_mW',
                    'I_DC_in_mA',
                    'MM_in_percent',
                    'Mod_Bias_in_mA',
                    'MPD_Dark_in_mA',
                    'MSABias',
                    'MSATxPavgAccuracy',
                    'MSATxPWR',
                    'PCBTemperature_in_C',
                    'SNR',
                    'uTempRaw'
                ],
                '100GB': [
                    'CwdmMaskMargin',
                    'Clr4MaskMargin',
                    'RisingTimeInPs',
                    'FallingTimeInPs',
                    'pm2PwrRaw',
                    'dcaPwrRaw',
                    'dcaDutOffset',
                    'Clr4EyeCaptureFileName',
                    'CwdmEyeCaptureFileName',
                    'TxPathLoss',
                    'MpdSetPoint',
                    'MsaVcc',
                    'MsaTemp',
                    'MsaTxPWR',
                    'MsaTxPwrScaleLt',
                    'MsaTxPwrScaleMt',
                    'MsaTxPwrScaleHt',
                    'MsaTxPwrOffset',
                    'RetryCnt',
                    'ModTherm',
                    'pm2PwrRawDelta_indBm',
                    'IdacDelta_inPercentage',
                    'CalculatedAPCSetpoint',
                    'Temp_delta_in_C',
                    'Vol_delta_in_Perc',
                    'TxPower_delta_in_dB',
                    'FwVer',
                    'RawData'
                ]
            }
        },
        functionaltest: {
            rx: {
                'common': [],
                '100GB': [
                    'RssiDutTxAllOffNoRefPwr',
                    'RssiDutTxAllOnNoRefPwr',
                    'RssiDutTxCh0OnNoRefPwr',
                    'RssiDutTxCh1OnNoRefPwr',
                    'RssiDutTxCh2OnNoRefPwr',
                    'RssiDutTxCh3OnNoRefPwr',
                    'RssiRefTxAllOff',
                    'RssiRefTxAllOn',
                    'RssiRefTxCh0On ',
                    'RssiRefTxCh1On',
                    'RssiRefTxCh2On',
                    'RssiRefTxCh3On',
                    'Ber',
                    'Atten'
                ]
            },
            tx: {
                'common': [],
                '100GB': [
                    'MPDOff',
                    'MPDOn',
                    'RefRssi',
                    'RelativeCompare',
                    'CrossTalkOffValueCh0',
                    'CrossTalkRelValueInDbCh0',
                    'CrossTalkOffValueCh1',
                    'CrossTalkRelValueInDbCh1',
                    'CrossTalkOffValueCh2',
                    'CrossTalkRelValueInDbCh2',
                    'CrossTalkOffValueCh3',
                    'CrossTalkRelValueInDbCh3',
                    'DefaultIdc',
                    'DefaultImod',
                    'TxPwrChkIdc',
                    'TxPwrChkImod',
                    'TxPwrChkMpd',
                    'TxPwrChkRefMsaRxPwr'
                ]
            }
        },
        rxtests: {
            sensitivity: {
                'common': [],
                '40GB': [
                    'ExtrapolatedPower_dBm',
                    'BERUpperBound',
                    'ConfidenceLevelAtExtrapolatedBER',
                    'Time_s',
                ],
                '100GB': [
                    'RSquared',
                    'Slope',
                    'Intercept',
                    'Cwdm4ExtraploatedOma',
                    'Clr4ExtraploatedOma',
                    'Alt1CdwmExtraploatedOma',
                    'TxTestBoard',
                    'RxTestBoard',
                    'R2_sens',
                    'CWDM4_sens',
                    'CWDM4_sens_alt1',
                    'CLR4',
                    'FwVer',
                    'RawData'
                ]
            },
            rssitest: {
                '40GB': ['Error', 'Attenuation', 'ExpectedPower', 'RSSIDD']
            },
            lostest: {
                '40GB': ['AssertPower', 'DeAssertPower', 'Hysterisis']
            },
            rxamplitude: {
                '40GB': ['Amplitude', 'AmplitudeRaw', 'EyeHeight', 'EyeHeightRaw']
            },
            refPwrCheck: {
                '100GB': [
                    'Atten1',
                    'RefTxPwrDbm1',
                    'RefTxPwrDiffDbm1',
                    'Atten2',
                    'RefTxPwrDbm2',
                    'RefTxPwrDiffDbm2',
                    'Atten3',
                    'RefTxPwrDbm3',
                    'RefTxPwrDiffDbm3'
                ]
            },
            overload: {
                '100GB': [
                    'BER',
                    'RefMsaTemp',
                    'DutMsaTemp',
                    'RefModTherm',
                    'TestDurationInSec',
                    'DutRssi',
                    'RefMpd',
                    'IthIdc',
                    'IthR2'
                ]
            },
            checkmsarxpwr: {
                '100GB': [
                    'Atten1',
                    'RefTxPwrDbm1',
                    'DutRxPwrDbm1',
                    'MsaRxPwr1',
                    'Atten2',
                    'RefTxPwrDbm2',
                    'DutRxPwrDbm2',
                    'MsaRxPwr2',
                    'Atten3',
                    'RefTxPwrDbm3',
                    'DutRxPwrDbm3',
                    'MsaRxPwr3',
                    'RxPower1_delta_in_dB',
                    'RxPower2_delta_in_dB',
                    'RxPower3_delta_in_dB',
                    'Atten4',
                    'RefTxPwrDbm4',
                    'DutRxPwrDbm4',
                    'MsaRxPwr4',
                    'RawRssi1',
                    'RawRssi2',
                    'RawRssi3',
                    'RawRssi4'
                ]
            },
            longdistance: {
                '100GB': [
                    'RefRssi',
                    'RefMsaTemp',
                    'RefModTherm',
                    'DutMpd',
                    'DutMsaTemp',
                    'DutModTherm',
                    'TimerWindow',
                    'Voltage',
                    'TestDurationInSec',
                    'BER',
                    'MaxBER'
                ]
            }
        },
        moduletests: {
            msatemp: {
                '40GB': ['MSATemperatureDelta_C', 'TemperatureTCReading_C']
            },
            vcctest: {
                '40GB': ['VccBoardReadback', 'VccDeltaPercent', 'VccMSARead']
            },
            power: {
                '40GB': ['PowerConsumption_W', 'PowerConsumptionDelta_W']
            }
        },
        actionstatus: {
            error: {
                '100GB': ['ActionName', 'TestErr']
            }
        },
        download: {
            download: {
                '40GB': []
            }
        },
        packout: {
            packout: {
                '40GB': [],
                '100GB': []
            }
        },
        link: {
            test: {
                'common': [
                    'name',
                    'counterRefreshTime',
                    'transceiver',
                    'transceiverSN',
                    'operSpeed',
                    'interfaceState',
                    'inOctets',
                    'inUcastPkts',
                    'inMulticastPkts',
                    'inBroadcastPkts',
                    'inDiscards',
                    'inerr_alignmentErrors',
                    'inerr_fcsErrors',
                    'inerr_giantFrames',
                    'inerr_runtFrames',
                    'inerr_rxPause',
                    'inerr_symbolErrors',
                    'totalInErrors',
                    'inBitsRate',
                    'inPktsRate',
                    'outOctets',
                    'outUcastPkts',
                    'outMulticastPkts',
                    'outBroadcastPkts',
                    'outDiscards',
                    'outerr_collisions',
                    'outerr_deferredTransmissions',
                    'outerr_lateCollisions',
                    'outerr_txPause',
                    'totalOutErrors',
                    'outBitsRate',
                    'outPktsRate',
                    'ch1_rxPower',
                    'ch1_temperature',
                    'ch1_txBias',
                    'ch1_txPower',
                    'ch1_voltage',
                    'ch2_rxPower',
                    'ch2_txBias',
                    'ch2_txPower',
                    'ch3_rxPower',
                    'ch3_txBias',
                    'ch3_txPower',
                    'ch4_rxPower',
                    'ch4_txBias',
                    'ch4_txPower',
                    'hwResets',
                    'transInterruptCount',
                    'transResetCount',
                    'hour',
                    'pnum',
                    'fileName',
                    'switch'
                ]
            }
        },
        calibration: {
            tp3PrimeCalChannel: {
                '100GB': [
                    'Pm2PwrAt0DbRaw',
                    'TxPathLoss',
                    'DcaRefOffset',
                    'DcaPwrRaw',
                    'OmaRaw',
                    'DcaPwr',
                    'Oma',
                    'TxCableLoss',
                    'RxCableLoss',
                    'Pm2StartOfLife',
                    'Pm2StartOfLifeLoss',
                    'PwrDriftResult',
                    'PwrLossDriftResult'
                ]
            },
            tp3Prim3CalModule: {
                '100GB': [
                    'RefChanPwrDiff',
                    'RefMeasuredTotalPwrInDbm',
                    'RefCalculatedTotalPwrInDbm',
                    'TotalPwrDiffResult'
                ]
            },
            opticalAttenCalChannel: {
                '100GB': [
                    'Pm1PwrAt0DbRaw',
                    'Pm1PwrAt5DbRaw',
                    'Pm1PwrAt10DbRaw',
                    'Pm1StartOfLife'
                ]
            }
        },
        tosa: {
            dc: {
                'common': [
                    'max_dark_current_ua',
                    'max_voltagev',
                    'maxdelta_wl_nm',
                    'min_photocurrent_ua',
                    'min_power_mw',
                    'overall_fail_code',
                    'owb_serial_number',
                    'smsr_current_ma',
                    'smsr_temp1min_db',
                    'smsr_temp2min_db',
                    'smsr_temp3min_db',
                    'sw_date',
                    'target_wl_ch0nm',
                    'target_wl_ch1nm',
                    'target_wl_ch2nm',
                    'target_wl_ch3nm',
                    'test_current_maa',
                    'thresh_range_ma',
                    'thresh_start_percent_max',
                    'thresh_temp1max_ma',
                    'thresh_temp2max_ma',
                    'thresh_temp3max_ma',
                    'machine_id',
                    'serial_number',
                    'cross_talk_current',
                    'mpd_current_ua_stripe0',
                    'mpd_current_ua_stripe1',
                    'mpd_current_ua_stripe2',
                    'mpd_current_ua_stripe3',
                    'temp',
                    'test_id',
                    'mpd_ratio_db_stripe0',
                    'mpd_ratio_db_stripe1',
                    'mpd_ratio_db_stripe2',
                    'mpd_ratio_db_stripe3',
                    'deltawl_nm',
                    'liv_current_ma',
                    'liv_power_mw',
                    'liv_voltagev',
                    'peakpwr_dbm',
                    'peakwl_nm',
                    'single_current_ma',
                    'single_power_mw',
                    'single_voltagev',
                    'smsr_db',
                    'class',
                    'dark_current',
                    'fail_code',
                    'kink',
                    'liv_mpd_ua',
                    'reverse_bias',
                    'single_mpd_ua',
                    'threshold_current',
                    'tsn',
                    'laser_pn'
                ]
            }
        },
        rosa: {
            dc: {
                'common': [
                    'I_mA',
                    'Idark_nA',
                    'Distance'
                ]
            }
        }
    }

};
