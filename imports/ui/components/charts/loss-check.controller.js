'use strict';


import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './loss-check.service';
import '../export-data/export-data.service';

/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').controller('LossCheckController', [
    '$scope', '$mdToast', '$cookies', '$translate', '$stateParams', '$location', 'LossCheckService', 'ExportDataService',
    ($scope, $mdToast, $cookies, $translate, $stateParams, $location, LossCheckService, ExportDataService) => {
        $scope.partNumbers = ['-all-'].concat(_.keys(Settings.partNumbers));
        $scope.intervals = _.keys(Settings.lossintervals);
        $scope.partNumber = $stateParams.pnum || '-all-';
        $scope.manufacturers = _.union(['-all-'], Settings.manufacturers);
        $scope.manufacturer = '-all-';
        $scope.device = $cookies.get('lossDevice') || '40GB';
        $scope.paramsFail = false;
        if ($stateParams.device) {
            $scope.device = $stateParams.device;
        }
        $scope.groupRack = false;
        $scope.reworkOnly = false;
        $scope.lossTrendValue = 'Fail qty';
        $scope.showProgress = false;
        let listOfSerials = [];
        if ($stateParams.rework === true) {
            $scope.reworkOnly = true;
        }
        if ($stateParams.week) {
            if ($stateParams.week.length === 10) {
                // This is retrieval per day
                $scope.range = 'day';
                $scope.intervalValue = 1000 + moment().diff(moment($stateParams.week), 'days');
                $scope.rangeLabel = moment().subtract($scope.intervalValue - 1000, 'days').format('YYYY-MM-DD');
            } else {
                // This is retrieval per week
                $scope.range = 'week';
                $scope.intervalValue = moment().week() - $stateParams.week - 1;
                $scope.rangeLabel = moment().week() - $scope.intervalValue - 1;
            }
            let iv = $scope.intervalValue;
            if (iv < 0) {
                iv = 53 + $scope.intervalValue;
            }
            $scope.interval = _.invert(Settings.lossintervals)[iv];
        } else {
            $scope.range = '';
            $scope.rangeLabel = '';
            $scope.intervalValue = 1007;
            $scope.interval = 'INTERVAL_LAST7DAYS';
        }
        $scope.lossChartTypes = ['Unique fails', 'Grouped fails', 'Fail trends'];
        $scope.lossChartType = $cookies.get('lossChartType') || 'Unique fails';
        $scope.racks = $scope.device === '40GB' ? Settings.spcRacks40GB : Settings.spcRacks100GB;

        let processRowsDebounce = _.debounce(processRows, 500, true);
        let charts = {};
        let chartsObjs = {};
        // Start initial load
        processRowsDebounce();

        // Event handler when manufacturer changed
        $scope.changeManufacturer = (manufacturer) => {
            $scope.manufacturer = manufacturer;
            processRowsDebounce();
        };
        // Event handler when part number changed
        $scope.changePartNumber = function (pn) {
            $scope.partNumber = pn;
            processRowsDebounce();
        };
        $scope.paramsFailClicked = function (pf) {
            $scope.paramsFail = pf;
            $cookies.put('lossParamsFail', pf);
            processRowsDebounce();
        };

        $scope.changeInterval = function (interval) {
            $scope.range = '';
            $scope.rangeLabel = '';
            $scope.intervalValue = Settings.lossintervals[interval];
            processRowsDebounce();
        };

        $scope.changeDevice = (device) => {
            $scope.device = device;
            $cookies.put('lossDevice', device);
            processRowsDebounce();
        };

        $scope.changeLossChartType = function (lct) {
            $cookies.put('lossChartType', lct);
            $scope.lossChartType = lct;
            processRowsDebounce();
        };

        $scope.groupRackClicked = function (val) {
            $scope.groupRack = val;
            processRowsDebounce();
        };

        $scope.reworkOnlyClicked = function (val) {
            $scope.reworkOnly = val;
            processRowsDebounce();
        };

        $scope.changeLossTrendValue = function (ltv) {
            $scope.lossTrendValue = ltv;
            processRowsDebounce();
        };

        $scope.exportClick = function () {
            exportData();
        };

        function processRows() {
            let racks = ['All_racks'];
            if ($scope.groupRack) {
                racks = $scope.racks;
            }
            _.each(racks, (rack) => {
                charts[rack] = null;
                chartsObjs[rack] = null;
                Meteor.call('losses', $scope.lossChartType, $scope.partNumber,
                    $scope.manufacturer, $scope.intervalValue, $scope.range, rack, $scope.reworkOnly, $scope.device, $scope.paramsFail,
                    (err, losses) => {
                        if (err) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .content(err)
                                    .position('bottom right')
                                    .hideDelay(3000));
                        } else {
                            listOfSerials = [];
                            _.each(losses, (loss) => {
                                listOfSerials = _.union(listOfSerials, loss.ids);
                                if ($scope.lossChartType === 'Fail trends') {
                                    processRowFailTrends(loss, rack, $scope.lossTrendValue, $scope.range + ' ' + $scope.rangeLabel);
                                } else {
                                    // console.log(loss._id.t.join(','));
                                    processRow(loss, rack, $scope.range + ' ' + $scope.rangeLabel);
                                }
                            });
                            initData(rack);
                        }
                    });
            });
        }

        function processRowFailTrends(doc, rack, ltv, title) {
            charts[rack] = LossCheckService.constructLossTrend(doc, charts[rack], rack, ltv, title, () => {
                if (chartsObjs[rack] !== undefined) {
                    chartsObjs[rack].render();
                }
            });
        }

        function processRow(doc, rack, title) {
            charts[rack] = LossCheckService.construct(doc, charts[rack], rack, title, (t) => {
                exportData(t, doc);
            });
        }

        // Executed when switching between tabs. Add data to created charts.
        function initData(rack) {
            setTimeout(function () {
                if (charts[rack] !== null && charts[rack].title !== undefined) {
                    let sortvar = 'y';
                    if ($scope.lossChartType === 'Fail trends') {
                        sortvar = 'x';
                    }
                    charts[rack].data[0].dataPoints = _.sortBy(charts[rack].data[0].dataPoints, sortvar);
                    if (document.querySelector('#lossChart' + rack) !== null) {
                        chartsObjs[rack] = new CanvasJS.Chart('lossChart' + rack, charts[rack]);
                        chartsObjs[rack].render();
                    }
                } else {
                    document.querySelector('#lossChart' + rack).innerHTML =
                        '<div style="padding:20px;font-weight:bold;font-size:15px;">NO DATA</div>';
                }
                $scope.widgetCtrl.setLoading(false);
            }, 20);
        }

        function exportData(tt, doc) {
            $scope.showProgress = true;
            Meteor.call('exportData', tt ? doc.ids : listOfSerials, [tt], null, null, null, 'F',
                (err, data) => {
                    if (err) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .content($translate.instant('Loss export error') + ' ' + err)
                                    .position('top right')
                                    .hideDelay(5000));
                    } else {
                        let ret = ExportDataService.exportData(data, 'loss_export_' + (tt || 'alltests'), $scope.partNumber);
                        let blob = new Blob([ret.substring(1)], {type: 'data:text/csv'});
                        $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
                        $scope.filename = 'losses-' + (tt || 'all') + '.csv';
                        setTimeout(() => {
                            let a = document.getElementById('lossdataexportlink');
                            $scope.showProgress = false;
                            a.click();
                        }, 1000);
                    }
                });
        }
    }
]);
