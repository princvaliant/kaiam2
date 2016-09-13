Settings = {
    site: {
        title: 'YOUR_SITE_TITLE',
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
    // How many days back for the query
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

    partNumbers: {
        XQX2100: {color: '#4661EE', device: '40GB'},
        XQX2103: {color: '#1BCDD1', device: '40GB'},
        XQX2104: {color: '#8FAABB', device: '40GB'},
        XQX2105: {color: '#B08BEB', device: '40GB'},
        XQX2195: {color: '#C08BEB', device: '40GB'},
        XQX2401: {color: '#738FAA', device: '40GB'},
        XQX2402: {color: '#EC5657', device: '40GB'},
        XQX2406: {color: '#EE1657', device: '40GB'},
        XQX2501: {color: '#A38FAA', device: '40GB'},
        XQX2502: {color: '#EB8CC6', device: '40GB'},
        XQX2503: {color: '#F5A52A', device: '40GB'},
        XQX2595: {color: '#65A52A', device: '40GB'},
        XQX3202: {color: '#068F7A', device: '40GB'},
        XQX3205: {color: '#038FAA', device: '40GB'},
        XQX3201: {color: '#438FAA', device: '40GB'},
        XQX3295: {color: '#C08BEB', device: '40GB'},
        XQX4000: {color: '#238FAA', device: '100GB'},
        XQX4001: {color: '#538FAA', device: '100GB'},
        XQX4008: {color: '#738FAA', device: '100GB'},
        XQX4009: {color: '#938FAA', device: '100GB'},
        XQX4010: {color: '#233FAA', device: '100GB'},
        XQX4100: {color: '#A38FAA', device: '100GB'},
        XQXRMA4000: {color: '#338FAA', device: '100GB'},
        XQXGRR4000: {color: '#138FAA', device: '100GB'}
    },

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
        'powercalbeforetx - beforetx': '#FFD700',
        'moduletests - msatemp': '#A6D785'
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
    spcRacks40GB: ['Rack_1', 'Rack_3', 'Rack_4', 'Rack_5', 'Rack_6', 'Rack_7', 'Rack_8', 'Rack_9', 'Rack_11'],
    spcRacks100GB: ['Rack21', 'Rack22', 'Rack23', 'Rack24', 'Rack25', 'Rack26', 'Rack27'],

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
        rxtests: {
            sensitivity: 'RxTSENS',
            rssitest: 'RxTRSSI',
            lostest: 'RxTLOS',
            rxamplitude: 'RxTAMP',
            rxfunctionality: 'RxTFUNC',
            checkmsarxpwr: 'RxPWR'
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
        let res = [];
        let device = Settings.partNumbers[partNumber].device;
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

    getTestConfigVariablesForPartNumber: function (partNumber, test, subtest, device) {
        let res = [];
        if (!device && Settings.partNumbers[partNumber]) {
            device = Settings.partNumbers[partNumber].device;
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
            },
            txfunctionality: {
                '100GB': [
                    'MPDOff',
                    'MPDOn',
                    'CrossTalkOffValueCh0',
                    'CrossTalkRelValueInDbCh0',
                    'CrossTalkOffValueCh1',
                    'CrossTalkRelValueInDbCh1',
                    'CrossTalkOffValueCh2',
                    'CrossTalkRelValueInDbCh2',
                    'CrossTalkOffValueCh3',
                    'CrossTalkRelValueInDbCh3'
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
                    'TxTestBoard',
                    'RxTestBoard',
                    'R2_sens',
                    'CWDM4_sens',
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
            rxfunctionality: {
                '100GB': [
                    'Amplitude',
                    'RssiAllOffNoInputPwr',
                    'RssiAllOnNoInputPwr',
                    'RssiCh0OnNoInputPwr',
                    'RssiCh1OnNoInputPwr',
                    'RssiCh2OnNoInputPwr',
                    'RssiCh3OnNoInputPwr',
                    'RssiAllOffRefPwr',
                    'RssiAllOnRefPwr',
                    'RssiCh0OnRefPwr',
                    'RssiCh1OnRefPwr',
                    'RssiCh2OnRefPwr',
                    'RssiCh3OnRefPwr',
                    'Ber',
                    'Atten',
                    'DefaultIdc',
                    'DefaultImod',
                    'TxPwrChkIdc',
                    'TxPwrChkImod',
                    'TxPwrChkMpd',
                    'TxPwrChkPm2',
                    // Module level
                    'MsaTemp',
                    'TosaTherm',
                    'ModThrem',
                    'FwVer'
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
                    'RxPower3_delta_in_dB'
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
                '40GB': []
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
                    'pnum'
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
        }
    }

};
