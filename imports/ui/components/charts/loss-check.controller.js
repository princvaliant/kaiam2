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
    '$scope', '$mdToast', '$cookies', '$translate', '$stateParams', '$timeout', '$location', '$document', 'LossCheckService', 'ExportDataService',
    ($scope, $mdToast, $cookies, $translate, $stateParams, $timeout, $location, $document, LossCheckService, ExportDataService) => {
        $scope.partNumbers = ['-all-'].concat(_.keys(Settings.partNumbers));
        $scope.intervals = _.keys(Settings.lossintervals);
        $scope.partNumber = $stateParams.pnum || '-all-';
        $scope.manufacturers = _.union(['-all-'], Settings.manufacturers);
        $scope.manufacturer = '-all-';
        $scope.device = $cookies.get('lossDevice') || '40GB';
        $scope.paramsFail = false;
        $scope.yieldType = $stateParams.yieldType || 'Fixed week';

        if ($stateParams.device) {
            $scope.device = $stateParams.device;
        }
        $scope.groupRack = false;
        $scope.groupRackDut = false;
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
        $scope.duts = $scope.device === '40GB' ? Settings.spcDUT40GB : Settings.spcDUT100GB;

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

        $scope.changeYieldType = (yieldType) => {
            $scope.yieldType = yieldType;
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
            $scope.racks = $scope.device === '40GB' ? Settings.spcRacks40GB : Settings.spcRacks100GB;
            $scope.duts = $scope.device === '40GB' ? Settings.spcDUT40GB : Settings.spcDUT100GB;
            $cookies.put('lossDevice', device);
            processRowsDebounce();
        };

        $scope.changeLossChartType = function (lct) {
            $cookies.put('lossChartType', lct);
            $scope.lossChartType = lct;
            processRowsDebounce();
        };

        $scope.groupRackClicked = function (val) {
            $scope.groupRackDut = false;
            $scope.groupRack = val;
            processRowsDebounce();
        };

        $scope.groupRackDutClicked = function (val) {
            $scope.groupRack = false;
            $scope.groupRackDut = val;
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

        $scope.exportSummary = function () {
            exportSummary();
        };

        function processRows () {
            let racks = ['All_racks'];
            let duts = ['All_duts'];
            if ($scope.groupRack) {
                racks = $scope.racks;
            }
            if ($scope.groupRackDut) {
                racks = $scope.racks;
                duts = $scope.duts;
            }
            LossCheckService.setMaxY();
            _.each(racks, (rack) => {
                _.each(duts, (dut) => {
                    charts[rack + dut] = null;
                    chartsObjs[rack + dut] = null;
                    Meteor.call('losses', $scope.lossChartType, $scope.partNumber,
                        $scope.manufacturer, $scope.intervalValue, $scope.range, rack, dut, $scope.reworkOnly,
                        $scope.device, $scope.paramsFail, $scope.yieldType,
                        (err, losses) => {
                            if (err) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content(err)
                                        .position('bottom right')
                                        .hideDelay(3000));
                            } else {
                                $scope.losses = losses;
                                listOfSerials = [];
                                _.each(losses, (loss) => {
                                    listOfSerials = _.union(listOfSerials, loss.ids);
                                    if ($scope.lossChartType === 'Fail trends') {
                                        processRowFailTrends(loss, rack, dut, $scope.lossTrendValue, $scope.range + ' ' + $scope.rangeLabel);
                                    } else {
                                        // console.log(loss._id.t.join(','));
                                        processRow(loss, rack, dut, $scope.range + ' ' + $scope.rangeLabel);
                                    }
                                });
                                initData(rack, dut, LossCheckService.getMaxY());
                                $scope.widgetCtrl.setLoading(false);

                                // If this is the last pass
                                if (racks[racks.length - 1] === rack && duts[duts.length - 1] === dut) {
                                    _.each(racks, (rack1) => {
                                        _.each(duts, (dut1) => {
                                            charts[rack1 + dut1].axisY2.maximum = LossCheckService.getMaxY();
                                            chartsObjs[rack1 + dut1].render();
                                        });
                                    });
                                }
                            }
                        });
                });
            });
        }

        function processRowFailTrends (doc, rack, dut, ltv, title) {
            charts[rack + dut] = LossCheckService.constructLossTrend(doc, charts[rack + dut], rack, dut, ltv, title, () => {
                if (chartsObjs[rack + dut] !== undefined) {
                    chartsObjs[rack + dut].render();
                }
            });
        }

        function processRow (doc, rack, dut, title) {
            charts[rack + dut] = LossCheckService.construct(doc, charts[rack + dut], rack, dut, title, (t) => {
                exportData(t, doc);
            });
        }

        // Executed when switching between tabs. Add data to created charts.
        function initData (rack, dut, maxy) {
            if (charts[rack + dut] !== null && charts[rack + dut].title !== undefined) {
                let sortvar;
                if ($scope.lossChartType === 'Fail trends') {
                    sortvar = 'x';
                } else {
                    sortvar = 'y';
                    charts[rack + dut].axisY2.maximum = maxy;
                }
                charts[rack + dut].data[0].dataPoints = _.sortBy(charts[rack + dut].data[0].dataPoints, sortvar);
                if (document.querySelector('#lossChart' + rack + dut) !== null) {
                    chartsObjs[rack + dut] = new CanvasJS.Chart('lossChart' + rack + dut, charts[rack + dut]);
                    chartsObjs[rack + dut].render();
                }
            } else {
                document.querySelector('#lossChart' + rack + dut).innerHTML =
                    '<div style="padding:20px;font-weight:bold;font-size:16px;">NO DATA</div>';
            }
        }

        function exportData (tt, doc) {
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
                        let blob = new Blob([ret.substring(1)], {type: 'data:text/csv;charset=utf-8'});
                        $scope.filename = 'losses-' + (tt || 'all') + '.csv';
                        if (window.navigator.msSaveOrOpenBlob) {
                            navigator.msSaveBlob(blob, $scope.filename);
                        } else {
                            let downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
                            let downloadLink = angular.element(downloadContainer.children()[0]);
                            downloadLink.attr('href', (window.URL || window.webkitURL).createObjectURL(blob));
                            downloadLink.attr('download', $scope.filename);
                            downloadLink.attr('target', '_blank');
                            $document.find('body').append(downloadContainer);
                            $timeout(function () {
                                downloadLink[0].click();
                                downloadLink.remove();
                                $scope.showProgress = false;
                            }, null);
                        }
                    }
                });
        }

        function exportSummary () {
            $scope.showProgress = true;
            let ret = '';
            _.each($scope.losses, (item) => {
                let row = '';
                let head = '';
                head += 'test,';
                row += item._id.tsts + ',';
                head += 'yield%,';
                row += item.pass * 100 + ',';
                head += 'fail,';
                row += item.fail + ',';
                head += 'total,';
                row += item.fail / (item.pass === 0 ? 1 : item.pass)  + ',';
                head += 'date,';
                row += item._id.d;
                if (ret === '') {
                    ret += ',' + head + '\n';
                }
                ret += row + '\n';
            });
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = encodeURI('data:text/csv;' + ret);
            a.download = 'loss-summary.csv';
            a.click();
        }
    }
]);
