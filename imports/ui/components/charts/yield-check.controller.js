'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './yield-check.service';

/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */


angular.module('kaiamCharts').controller('YieldCheckController', [
    '$scope', '$state', '$mdToast', '$cookies', '$translate', '$mdDialog', '$stateParams', '$location', 'YieldCheckService',
    ($scope, $state, $mdToast, $cookies, $translate, $mdDialog, $stateParams, $location, YieldCheckService) => {
        $scope.minTotals = [0, 10, 25, 50, 100];
        $scope.minTotal = $cookies.get('yieldMinTotal') || 10;
        $scope.manufacturer = '-all-';
        $scope.manufacturers = _.union(['-all-'], Settings.manufacturers);
        $scope.device = $cookies.get('yieldDevice') || '40GB';
        $scope.yieldType = $cookies.get('yieldType') || 'Per week';
        let charts = null;
        let chartsObjs = null;

        $scope.interval = $cookies.get('yieldInterval') || 'Weekly';
        $scope.changeInterval = (interval) => {
            $scope.interval = interval;
            $cookies.put('yieldInterval', interval);
            processRows();
        };
        $scope.changeYieldType = (yieldType)=> {
            $scope.yieldType = yieldType;
            $cookies.put('yieldType', yieldType);
            processRows();
        };
        // Event handler when manufacturer changed
        $scope.changeManufacturer = (manufacturer) => {
            $scope.manufacturer = manufacturer;
            processRows();
        };
        $scope.changeMinTotal = (minTotal) => {
            $cookies.put('yieldMinTotal', minTotal);
            $scope.minTotal = minTotal;
            processRows();
        };
        $scope.exportPointClick = (lab, pn) => {
            console.log(pn + lab);
        };
        $scope.changeDevice = (device) => {
            $scope.device = device;
            $cookies.put('yieldDevice', device);
            processRows();
        };

        processRows();

        function processRows() {
            charts = undefined;
            chartsObjs = undefined;
            Meteor.call('yields', $scope.minTotal,
                $scope.manufacturer,
                $scope.interval,
                $scope.device,
                $scope.yieldType, (err, yields) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content(err)
                                .position('bottom right')
                                .hideDelay(3000));
                    } else {
                        $scope.yields = yields;
                        _.each(yields, (yld) => {
                            processRow(yld);
                        });
                        if (yields.length > 0) {
                            initData();
                        }
                    }
                });
        }

        function processRow(doc) {
            charts = YieldCheckService.construct(doc, charts,
                'PARAMETRIC', () => {
                    if (chartsObjs !== undefined) {
                        chartsObjs.render();
                    }
                }, (pnum, week) => {
                    $state.go('triangular.losscheck', {
                        pnum: pnum,
                        week: week,
                        rework: $scope.interval === 'Rework',
                        device: $scope.device
                    });
                });
        }

        // Executed when switching between tabs. Add data to created charts.
        function initData() {
            setTimeout(() => {
                if (charts !== undefined) {
                    charts.data = _.sortBy(charts.data, 'legendText');
                    if (document.querySelector('#yieldChartParametric') !== null) {
                        chartsObjs = new CanvasJS.Chart('yieldChartParametric', charts);
                        chartsObjs.render();
                    }
                }
                $scope.widgetCtrl.setLoading(false);
            }, 20);
        }

        // Event handler when export clicked
        $scope.exportClick = () => {
            let ret = '';
            if ($scope.device === '40GB') {
                let yields = $scope.yields;
                _.each(yields, (item) => {
                    let row = '';
                    let head = '';
                    for (let v in item) {
                        if (v === '_id') {
                            for (let v2 in item[v]) {
                                head = v2 + ',' + head;
                                row = item[v][v2] + ',' + row;
                            }
                        } else if (v !== '_id') {
                            head = v + ',' + head;
                            row = item[v] + ',' + row;
                        }
                    }
                    if (ret === '') {
                        ret += ',' + head + '\n';
                    }
                    ret += row + '\n';
                });
                doExport('yields_test_parametric', ret);
            } else {
                let confirm = $mdDialog.confirm()
                    .title('Export by status')
                    .ariaLabel('export by status')
                    .ok('Passes only')
                    .cancel('Fails only');
                $mdDialog.show(confirm).then(function () {
                    exportSummary('P');
                }, function () {
                    exportSummary('F');
                });
            }
        };
    }
]);

function exportSummary(status) {
    let ret = '';
    Meteor.call('getTestSummaries', status, (err, testSummaries) => {
        if (err) {
            $mdToast.show(
                $mdToast.simple()
                    .content(err)
                    .position('bottom right')
                    .hideDelay(3000));
        } else {
            _.each(testSummaries, (item) => {
                let row = '';
                let head = '';
                head += 'sn,';
                row += item.sn + ',';
                head += 'pnum,';
                row += item.pnum + ',';
                head += 'spec,';
                row += item.spec + ',';
                head += 'd,';
                row += item.d + ',';
                head += 'w,';
                row += item.w + ',';
                head += 'cm,';
                row += item.cm + ',';
                head += 'rack,';
                row += item.rack.toString().replace(/,/g, '|') + ',';
                head += 'dut,';
                row += item.dut.toString().replace(/,/g, '|') + ',';
                head += 'status,';
                row += item.status + ',';
                head += 'tsts,';
                row += item.tsts.toString().replace(/,/g, '|') + ',';
                head += 'tstparams,';
                row += item.tstparams.toString().replace(/,/g, '|') + ',';
                if (ret === '') {
                    ret += ',' + head + '\n';
                }
                ret += row + '\n';
            });
            doExport('test_summaries', ret);
        }
    });
}

function doExport(name, list) {
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = encodeURI('data:text/csv;' + list);
    a.download = name + '.csv';
    a.click();
}
