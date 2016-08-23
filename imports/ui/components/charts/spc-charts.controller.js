import angular from 'angular';
import './spc-charts.service';
import './spc-charts-limits.controller';
import './spc-charts-limits.tmpl.html';
/**
 * @ngdoc controller
 * @name SpcChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').controller('SpcChartsController', [
    '$scope', '$mdToast', '$mdDialog', '$timeout', '$stateParams', '$cookies', 'SpcChartsService',
    ($scope, $mdToast, $mdDialog, $timeout, $stateParams, $cookies, SpcChartsService) => {
        // Retrieve what is the test type (txtest, rxtest etc.)  and subtype ('sensitivity', rssitest' etc)
        $scope.testType = $stateParams.type;
        $scope.testSubType = $stateParams.subtype;
        // Select first tab
        $scope.selectedIndex = 0;
        // Initialize list for part number dropdown
        $scope.serialNumbers = ['-all-'];
        $scope.serialNumber = $cookies.get('spcSNSel') || '-all-';
        $scope.searchNumbers = [];
        $scope.showAll = false;
        $scope.device = $cookies.get('spcDevice') || '40GB';
        initRacks();

        // Grouping radio button
        $scope.grouping = $cookies.get('spcGrouping') || 'channel';
        $scope.grouping === 'channel' ? $scope.cols = 2 : $scope.cols = 3;

        // Event handler fo field tab select
        $scope.tabSelected = (field) => {
            $scope.field = field;
            initData();
        };

        $scope.changeDevice = (device) => {
            $scope.device = device;
            $cookies.put('spcDevice', device);
            initRacks();
            subs();
        };

        // Event handler when rack changed
        $scope.changeRack = (rack) => {
            $cookies.put('spcRacksSel' + $scope.device, rack);
            $scope.rack = rack;
            subs();
        };

        // Event handler when serial number changed
        $scope.changeSerialNumber = (serialNumber) => {
            $cookies.put('spcSNSel', serialNumber);
            $scope.serialNumber = serialNumber;
            subs();
        };

        $scope.changeGrouping = (grouping) => {
            $cookies.put('spcGrouping', grouping);
            $scope.grouping = grouping;
            $scope.grouping === 'channel' ? $scope.cols = 2 : $scope.cols = 3;
            subs();
        };

        $scope.showAllClicked = function (val) {
            $scope.showAll = val;
            subs();
        };

        $scope.searchClick = (searchSerial) => {
            if (searchSerial) {
                $scope.searchNumbers = searchSerial.replace(/\s/g, '').split(',');
            } else {
                $scope.searchNumbers = [];
            }
            subs();
        };

        // Event handler when export clicked
        $scope.exportClick = () => {
            let a = document.getElementById('spcexportlink');
            a.click();
        };

        $scope.subscribe('testdataexclude', () => [], {
            onReady: function () {
                $scope.excludedata = TestdataExclude.findOne();
                $scope.subscribe('spclimits', () => [], {
                    onReady: function () {
                        subs();
                    }
                });
            }
        });

        // Call subscription all for the first initialization
        function subs() {
            if ($scope.widgetCtrl) {
                $scope.widgetCtrl.setLoading(true);
            }
            let ttd = Settings.getTestConfigVariablesForPartNumber('', $scope.testType, $scope.testSubType, $scope.device);
            $scope.fields = _.pluck(ttd, 'v');
            if ($scope.field === undefined) {
                $scope.field = $scope.fields[0];
            }
            Meteor.call('testdataspcs', $scope.testType, $scope.testSubType, $scope.rack, $scope.searchNumbers, $scope.device, (err, spcs) => {
                $timeout(function () {
                    $scope.widgetCtrl.setLoading(false);
                }, 20);
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    $scope.spcs = spcs;

                    processChart(spcs);
                    initData();
                    $scope.racks.sort();
                    $scope.serialNumbers.sort();
                }
            });
        }

        function initRacks() {
            $scope.racks = ['-all-'].concat(Settings['spcRacks' + $scope.device]).sort();
            $scope.rack = $cookies.get('spcRacksSel' + $scope.device) || $scope.racks[0];
        }


        function calculateExport() {
            $scope.csvContent = '';
            let spcs = $scope.spcs;
            _.each(spcs, (item) => {
                let row = '';
                let head = ',';
                for (let v in item) {
                    switch (v) {
                        case 'timestamp':
                            head += v + ',';
                            row += moment(item[v]).format('YYYY-MM-DD HH:mm:ss') + ',';
                            break;
                        case 'type':
                        case 'subtype':
                            head += v + ',';
                            row += item[v] + ',';
                            break;
                        case 'device':
                        case 'meta':
                        case 'data':
                            for (let v2 in item[v]) {
                                head += v2 + ',';
                                row += item[v][v2] + ',';
                            }
                            break;
                        default:
                            break;
                    }
                }
                if ($scope.csvContent === '') {
                    $scope.csvContent += head + '\n';
                }
                $scope.csvContent += row + '\n';
            });

            var blob = new Blob([$scope.csvContent.substring(1)], {type: 'data:text/csv'});
            $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
            $scope.filename = 'spcs_' + $scope.testType + '_' + $scope.testSubType + '.csv';
        }

        // Observer on published cursor
        function processChart(spcs) {
            // Initialize variable that contains chart definitions
            $scope.charts = undefined;
            _.each(spcs, (doc) => {
                $scope.serialNumbers = _.union($scope.serialNumbers, [doc.device.SerialNumber]);
                if (($scope.serialNumber === '-all-' && $scope.searchNumbers.length === 0) ||
                    $scope.serialNumber === doc.device.SerialNumber ||
                    _.contains($scope.searchNumbers, doc.device.SerialNumber)) {
                    _.each($scope.fields, function (field) {
                        $scope.charts = SpcChartsService.construct(doc, field, $scope.grouping, $scope.rack, $scope.showAll,
                            $scope.charts, $scope.excludedata, (g, name) => {
                                if (name === 'LIMIT') {
                                    showSpclimit(field, g);
                                }
                                if ($scope.chartsObjs !== undefined) {
                                    $scope.chartsObjs[field][g].render();
                                }
                            });
                    });
                }
            });
        }

        // Executed when switching between tabs. Add data to created charts.
        function initData() {
            $scope.chartsObjs = {};
            if ($scope.charts !== undefined) {
                for (let key in $scope.charts[$scope.field]) {
                    // Calculate six sigma on chart
                    calculateSixSigma($scope.charts[$scope.field][key]);
                    calculateLimit($scope.field, key);
                    if ($scope.chartsObjs === undefined) {
                        $scope.chartsObjs = {};
                    }
                    if ($scope.chartsObjs[$scope.field] === undefined) {
                        $scope.chartsObjs[$scope.field] = {};
                    }
                    $timeout(function () {
                        if (document.querySelector('#spc' + $scope.field + key) !== null) {
                            $scope.chartsObjs[$scope.field][key] = new CanvasJS.Chart('spc' + $scope.field +
                                key, $scope.charts[$scope.field][key]);
                            $scope.chartsObjs[$scope.field][key].render();
                        }
                    }, 50);
                }
            }
            calculateExport();
        }

        function showSpclimit(field, g) {
            $mdDialog.show({
                controller: 'SpcChartsLimitsController',
                templateUrl: 'imports/ui/components/charts/spc-charts-limits.tmpl.html',
                clickOutsideToClose: true,
                locals: {
                    field: field,
                    grp: g,
                    rack: $scope.rack,
                    pn: $scope.serialNumber,
                    refresh: initData
                }
            });
        }

        function calculateLimit(field, grp) {
            if ($scope.charts[field] && $scope.charts[field][grp]) {
                let doc = Spclimits.findOne({
                    field: field,
                    grp: grp + '',
                    rack: $scope.rack === '-all-' ? '' : $scope.rack,
                    pn: $scope.serialNumber === '-all-' ? '' : $scope.serialNumber
                });
                if (doc) {
                    var chart = $scope.charts[field][grp];
                    chart.axisY.stripLines[1] = {
                        startValue: doc.low || null,
                        endValue: doc.high || null,
                        color: '#011D8A',
                        opacity: 0.3
                    };
                }
            }
        }

        function calculateSixSigma(chart) {
            let arr = [];
            _.each(chart.data, function (series) {
                _.each(series.dataPoints, function (point) {
                    arr.push(point.y);
                });
            });
            let stddev = SpcChartsService.standardDeviation(arr);
            let mean = SpcChartsService.average(arr);
            chart.axisY.stripLines = [{
                startValue: mean + 3 * stddev,
                endValue: mean - 3 * stddev,
                color: '#AFFABD'
            }, {
                startValue: null,
                endValue: null
            }];
        }
    }
]);
