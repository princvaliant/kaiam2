let exec = Npm.require('child_process').exec;

// Execute aggregation that stores result in separate collections
Scheduler = {

    executeAggregate: function (pipeline) {
        let ret = '';
        let res = '';
        let conn = process.env.MONGO_URL.replace('db://', ' ');
        conn = conn.split((/[\s,?@$:]+/));
        if (process.env.NODE_ENV === 'development') {
            res = conn[0] + ' --ssl  --sslAllowInvalidCertificates -u "' + conn[1] + '" -p "' + conn[2] + '" ' + conn[3] + ':' + conn[4];
            //res = conn[0] + ' ' + conn[1] + ':' + conn[2];
        } else {
            res = conn[0] + ' -u "' + conn[1] + '" -p "' + conn[2] + '" ' + conn[5] + ':' + conn[6] +
                ' --ssl --sslAllowInvalidCertificates ';
        }
        let aggr = res +
            ' --eval \'db.testdata.aggregate(' + pipeline + ', {allowDiskUse: true})\'';
        aggr = aggr.replace(/(\r\n|\n|\r)/gm, '');
        exec(aggr, function (error, stdout, stderr) {
            ret = 'stdout: ' + stdout + ' stderr: ' + stderr;
            if (error !== null) {
                ret += 'exec error: ' + error;
            }
        });
    },

    executeMapReduce: function (map, reduce, options) {
        let ret = '';
        let res = '';
        let regex = /\/\/\s\d+|\/\//g;
        let maps = (map + '').replace('map(', '(').replace(regex, '');
        let reduces = (reduce + '').replace('reduce(', '(').replace(regex, '');
        let conn = process.env.MONGO_URL.replace('db://', ' ');
        conn = conn.split((/[\s,?@$:]+/));
        if (process.env.NODE_ENV === 'development') {
            res = conn[0] + ' -u "' + conn[1] + '" -p "' + conn[2] + '" ' + conn[3] + ':' + conn[4] + ' --ssl --sslAllowInvalidCertificates ';
        } else {
            res = conn[0] + ' -u "' + conn[1] + '" -p "' + conn[2] + '" ' + conn[5] + ':' + conn[6] +
                ' --ssl --sslAllowInvalidCertificates ';
        }
        let aggr = res +
            ' --eval \'db.testdata.mapReduce(' + maps + ', ' + reduces + ', ' + options + ')\'';
        aggr = aggr.replace(/(\r\n|\n|\r)/gm, '');
        exec(aggr, function (error, stdout, stderr) {
            ret = 'stdout: ' + stdout + ' stderr: ' + stderr;
            if (error !== null) {
                ret += 'exec error: ' + error;
            }
        });
    },

    getYieldLossMatch: function () {
        return {
            $and: [{
                $or: [
                    {
                        'device.PartNumber': {
                            $regex: '^XQX2'
                        }
                    },
                    {
                        'device.PartNumber': {
                            $regex: '^XQX3'
                        }
                    }
                ]
            }, {
                timestamp: {
                    $gt: 'DATEFILTER' //moment().subtract(99, 'days').toDate() //  //
                }
            }, {
                'type': {
                    '$in': _.keys(Settings.testConfig)
                }
            }, {
                'meta.EndDateTime': {
                    $ne: null
                }
            }, {
                'device.SerialNumber': {
                    $ne: null
                }
            }, {
                'meta.Rack': {
                    '$ne': 'Rack_6'
                }
            }]
        };
    },

    getYieldProject: function () {
        let offset = Math.abs(moment().utcOffset() * 60000);
        return {
            __id: '$_id',
            mid: '$mid',
            pnum: '$device.PartNumber',
            sn: '$device.SerialNumber',
            t: '$type',
            tst: {
                $concat: ['$type', ' - ', '$subtype']
            },
            st: '$status',
            ds: '$downstatus',
            r: '$result',
            cm: '$device.ContractManufacturer',
            sd: '$meta.StartDateTime',
            ed: '$meta.EndDateTime',
            bd: '$device.brDate',
            rack: '$meta.Rack',
            dut: '$meta.DUT',
            usr: '$meta.User',
            script: '$meta.ScriptName',
            diff: {
                $subtract: ['$meta.StartDateTime', '$device.brDate']
            },
            d: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            nd: {
                $dateToString: {
                    format: '%Y%j',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            w: {
                $add: [{
                    $week: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }, 0]
            },
            nw: {
                $dateToString: {
                    format: '%Y%U',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            },
            m: {
                $month: {
                    $subtract: ['$meta.StartDateTime', offset]
                }
            },
            nm: {
                $dateToString: {
                    format: '%Y%m',
                    date: {
                        $subtract: ['$meta.StartDateTime', offset]
                    }
                }
            }
        };
    }
};
