
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
CTestdataSpc = new Meteor.Collection('c_testdataspcs');

angular.module('kaiamCharts').controller('SpcChartsController', [
    '$scope', '$mdToast', '$meteor', '$mdDialog', '$stateParams', '$cookies', 'SpcChartsService', ($scope, $mdToast, $meteor, $mdDialog, $stateParams, $cookies, SpcChartsService) => {
        // Retrieve what is the test type (txtest, rxtest etc.)  and subtype ('sensitivity', rssitest' etc)
        $scope.testType = $stateParams.type;
        $scope.testSubType = $stateParams.subtype;
        // Select first tab
        $scope.selectedIndex = 0;
        // Initialize list for part number dropdown
        $scope.serialNumbers = [''];
        $scope.serialNumber = $cookies.get('spcSNSel') || '';
        $scope.searchNumbers = [];
        $scope.showAll = false;
        $scope.device = $cookies.get('spcDevice') || '40GB';
        initRacks();
        let csvContent = '';

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

        $scope.showAllClicked = function(val) {
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

        subs();

        // Call subscription all for the first initialization
        function subs() {
            if ($scope.widgetCtrl) {
                $scope.widgetCtrl.setLoading(true);
            }
            SpcChartsService.subscribe($scope.testType, $scope.testSubType, $scope.rack, $scope.searchNumbers, $scope.device, () => {
                let ttd = Settings.getTestConfigVariablesForPartNumber('', $scope.testType, $scope.testSubType, $scope.device);
                $scope.fields = _.pluck(ttd, 'v');
                if ($scope.field === undefined) {
                    $scope.field = $scope.fields[0];
                }
                startObserver();
                initData();
                $scope.racks.sort();
                $scope.serialNumbers.sort();
            });
        }

        function initRacks() {
            $scope.racks = [''].concat(Settings['spcRacks' + $scope.device]).sort();
            $scope.rack = $cookies.get('spcRacksSel' + $scope.device) ||  $scope.racks[0];
        }


        function calculateExport() {
            $scope.csvContent = '';
            let spcs = getFindCursor({});
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

            var blob = new Blob([ $scope.csvContent.substring(1) ], { type : 'data:text/csv' });
            $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );
            $scope.filename = 'spcs_' + $scope.testType + '_' + $scope.testSubType + '.csv';
        }

        // Observer on published cursor
        function startObserver() {
            // Initialize variable that contains chart definitions
            $scope.charts = {};
            // Observer on published cursor
            _.each(getFindCursor({}), (doc) => {
                $scope.serialNumbers = _.union($scope.serialNumbers, [doc.device.SerialNumber]);
                if ((!$scope.serialNumber && $scope.searchNumbers.length === 0) || $scope.serialNumber === doc.device.SerialNumber || _.contains($scope.searchNumbers, doc.device.SerialNumber)) {
                    _.each($scope.fields, function (field) {
                        $scope.charts = SpcChartsService.construct(doc, field, $scope.grouping, $scope.rack, $scope.showAll, $scope.charts, (g, name) => {
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

        function showSpclimit(field, g) {
            $mdDialog.show({
                controller: 'SpcChartsLimitsController',
                templateUrl: 'imports/ui/components/charts/spc-charts-limits.tmpl.ng.html',
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
                    rack: $scope.rack || '',
                    pn: $scope.serialNumber || ''
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

        // Retrieve cursor for current test type
        function getFindCursor(addq) {
            let query = _.extend({
                type: $scope.testType,
                subtype: $scope.testSubType
            }, addq);
            if ($scope.rack !== '') {
                query['meta.Rack'] = $scope.rack;
            }
            if ($scope.device === '40GB') {
                query['device.PartNumber'] = new RegExp('^LR4', 'i');
            }
            if ($scope.device === '100GB' && $scope.testType !== 'calibration') {
                query['device.PartNumber'] = 'XQX4000_Control';
            }
            let sort = {};
            if ($scope.grouping === 'slot') {
                sort = {
                    'meta.DUT': 1,
                    'meta.Channel': 1,
                    'timestamp': 1
                };
            } else {
                sort = {
                    'meta.Channel': 1,
                    'meta.DUT': 1,
                    'timestamp': 1
                };
            }
            return CTestdataSpc.find(query, {
                sort: sort
            }).fetch();
        }

        // Executed when switching between tabs. Add data to created charts.
        function initData() {
            setTimeout(function () {
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
                        if (document.querySelector('#spc' + $scope.field + key) !== null) {
                            $scope.chartsObjs[$scope.field][key] = new CanvasJS.Chart('spc' + $scope.field +
                                key, $scope.charts[$scope.field][key]);
                            $scope.chartsObjs[$scope.field][key].render();
                        }
                    }
                }
                $scope.widgetCtrl.setLoading(false);
                calculateExport();
            }, 100);
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
