'use strict';
/**
 * @ngdoc service
 * @name SpcChartsService
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts')
    .service('ExportDataService', ['$meteor',
        function($meteor) {
            let service = {
                exportData: function (data, exportDetails, pnum) {
                    let ret = '';
                    _.each(data, function (item) {
                        let row = '';
                        let head = ',';
                        let arr = [];
                        if (item.fails === undefined) {
                            item.fails = [];
                        }
                        if (item.failsrt === undefined) {
                            item.failsrt = [];
                        }
                        for (let v in item) {
                            if (v === 'date') {
                                head += v + ',';
                                row += moment(item[v]).format('YYYY-MM-DD HH:mm:ss') + ',';
                            } else if (v === 'fails' || v === 'failsrt') {
                                head += v + ',';
                                if (Array.isArray(item[v])) {
                                    row += item[v].toString().replace(/,/g, '|') + ',';
                                }
                            } else if (v !== 'data') {
                                head += v + ',';
                                row += item[v] + ',';
                            }
                        }
                        if (item.test !== undefined && item.subtest !== undefined) {
                            let ttd1 = Settings.getTestConfigVariablesForPartNumber(pnum, item.test, item.subtest);
                            let ttd = _.pluck(ttd1, 'v');
                            _.each(ttd, (v2) => {
                                if (item.data[v2] instanceof Array) {
                                    if (item.data[v2].length > 0 && typeof item.data[v2][0] === 'string') {
                                        head += v2 + ',';
                                        row += item.data[v2].toString().replace(/,/g, '|').replace(/[\n\r,]/g, '') + ',';
                                    } else {
                                        arr.push(item.data[v2]);
                                    }
                                } else if (typeof item.data[v2] === 'string') {
                                    head += v2 + ',';
                                    row += item.data[v2].replace(/[\n\r,]/g, '').replace(/[\n\r,]/g, '') + ',';
                                } else if (item.data[v2] !== null && item.data[v2] !== undefined) {
                                    head += v2 + ',';
                                    row += item.data[v2] + ',';
                                } else {
                                    head += v2 + ',';
                                    row += ' ,';
                                }
                            });
                            for (let v2 in item.data) {
                                if (exportDetails === true) {
                                    if (item.data[v2] instanceof Array && item.data[v2].length > 0) {
                                        let details = item.data[v2][0];
                                        for (let detail in details) {
                                            head += detail + ',';
                                        }
                                    }
                                }
                            }
                        }
                        if (ret === '') {
                            ret += head + '\n';
                        }
                        if (exportDetails === true) {
                            if (arr.length === 0) {
                                ret += row + '\n';
                            } else {
                                _.each(arr, (a1) => {
                                    let l = a1.length;
                                    for (let i = 0; i < l; i++) {
                                        let row1 = '';
                                        for (let detail in a1[i]) {
                                            row1 +=  (a1[i][detail] || '') + ',';
                                        }
                                        ret += row + row1 + '\n';
                                    }
                                });
                            }
                        } else {
                            ret += row + '\n';
                        }
                    });
                    return ret;
                },

                convertToRows: function (list, pnum) {
                    let arr = [];
                    let tt = Settings.getTestConfigVariablesForPartNumber(pnum, '', '');
                    let bySnum = _.groupBy(list, function (o) {
                        let v = _.isNumber(o.v) && o.v < 50 && o.v >= 0 ? o.v.toFixed(2) : 'x';
                        let c = _.isNumber(o.c) ? o.c : 'x';
                        let t = _.isNumber(o.t) && o.t < 200 && o.t >= 0 ? ('00' + o.t).slice(-2) : 'x';
                        return o.snum + '_' + o.mid + '_' + v + '_' + c + '_' + t;
                    });
                    _.each(_.keys(bySnum).sort(), (key) => {
                        let res = {};
                        let values = bySnum[key];
                        let first = values[0];
                        res.uid = key;
                        res.snum = first.snum;
                        res.date = first.date;
                        res.rack = first.r;
                        res.dut = first.d;
                        res.pnum = first.pnum;
                        res.manuf = first.manuf;
                        res.volt = first.v !== undefined ? first.v : '';
                        res.chan = first.c !== undefined ? first.c : '';
                        res.temp = first.t !== undefined ? first.t : '';
                        res.ares = first.ares;
                        res.tres = first.tres;
                        res.swver = first.swver;
                        let flat = {};
                        let tres = 'OK';
                        res.fails = [];
                        res.failsrt = [];
                        _.each(values, (val) => {
                            if (val.tres === 'ERR') {
                                tres = 'ERR';
                            }
                            if (val.fails) {
                                res.fails = res.fails.concat(val.fails);
                            }
                            if (val.failsrt) {
                                res.failsrt = res.failsrt.concat(val.failsrt);
                            }
                            for (let dt in val.data) {
                                flat[val.test + ' ' + val.subtest + ' ' + dt] = val.data[dt];
                            }
                        });
                        res.tres = tres;

                        _.each(tt, (t) => {
                            if (t.t !== '') {
                                if (!Array.isArray(flat[t.k])) {
                                    res[t.t + ' ' + t.v] = flat[t.k] !== undefined ? flat[t.k] : '';
                                } else {
                                    if (flat[t.k].length > 0 && typeof flat[t.k][0] === 'string') {
                                        res[t.t + ' ' + t.v] = flat[t.k].toString().replace(/,/g, '|').replace(/[\n\r,]/g, '');
                                    } else {
                                        res[t.t + ' ' + t.v] = '';
                                    }
                                }
                            }
                        });

                        arr.push(res);
                    });
                    return arr;
                }
            };
            return service;
        }
    ]);
