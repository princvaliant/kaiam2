'use strict';

import angular from 'angular';
import '../transceiver-view/gallery-dialog.controller';
import '../transceiver-view/gallery-dialog.tmpl.html';

/**
 * @ngdoc function
 * @name TransceiverController
 * @module kaiamCustomer
 * @kind function
 *
 *
 */
angular.module('kaiamCustomer').controller('TransceiverController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader) => {
        $translatePartialLoader.addPart('customer');
        $translate.refresh();
        $scope.code = $location.search().id;
        $scope.scans = [];
        $scope.showProgress = false;
        $scope.grouping = $cookies.get('transceiversGrouping') || 'testData';

        // Grouping radio button
        $scope.grouping = $cookies.get('transceiversGrouping') || 'errorCheck';
        $scope.changeGrouping = (grouping) => {
            $cookies.put('transceiversGrouping', grouping);
            $scope.grouping = grouping;
            retrieve();
        };

        // Grid for test parameters
        $scope.gridOptions = {
            enableFiltering: false,
            enableSorting: false,
            useExternalSorting: false,
            showGridFooter: false,
            columnDefs: [{
                name: 'SerialNumber',
                enableFiltering: false
            }, {
                name: 'SetTemperature_C',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'Channel',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'Er_in_dB',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'MM_in_percent',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'OMA_in_dBm',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'Pavg_in_dBm',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }, {
                name: 'Sensitivity_dBm',
                enableFiltering: false,
                cellClass: 'grid-align-center'
            }],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        retrieve();

        $scope.select = function (obj) {
            $scope.selected = obj;
        };

        function initSensitivityCharts (data) {
            $scope.sensCharts = [];
            for (let i = data.length - 1; i >= 0; --i) {
                let row = data[i];
                let title = 'Cn: ' + row.meta.Channel + ', Tmp: ' + row.meta.SetTemperature_C + 'C, RSqr: ' +
                    row.data.RSquared.toFixed(2) + ', CEOma:' + row.data.Cwdm4ExtraploatedOma.toFixed(2);
                let chart = {
                    _id: row._id,
                    zoomEnabled: true,
                    zoomType: 'xy',
                    animationEnabled: false,
                    title: {
                        text: title,
                        fontSize: 16,
                        fontColor: 'DarkSlateGrey'
                    },
                    axisX: {
                        title: 'Oma - - ' + moment(row.timestamp).format('YYYY-MM-DD hh:mm'),
                        labelAngle: -10,
                        titleFontSize: 14,
                        minimum: -17,
                        maximum: -8
                    },
                    axisY: {
                        title: 'Q',
                        gridThickness: 1,
                        titleFontSize: 14,
                        minimum: -1.5,
                        maximum: 0
                    },
                    legend: {
                        verticalAlign: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: 12,
                        fontColor: 'DarkSlateGrey',
                        fontFamily: 'Tahoma',
                        cursor: 'pointer'
                    },
                    data: []
                };
                if (row.data && row.data.RawData) {
                    let series = {
                        'type': 'line',
                        markerSize: 4,
                        dataPoints: []
                    };
                    row.data.RawData.forEach((p) => {
                        series.dataPoints.push({
                            x: p.Oma,
                            y: p.Q
                        });
                    });
                    chart.data.push(series);
                    $scope.sensCharts.push(chart);
                }
            }

            setTimeout(function () {
                $scope.sensCharts.forEach((ch) => {
                    if (document.querySelector('#sens' + ch._id) !== null) {
                        let sch = new CanvasJS.Chart('sens' + ch._id, ch);
                        sch.render();
                    }
                });
            }, 200);
        }

        function findTransceiver (code) {
            $scope.showProgress = true;
            if ($scope.grouping === 'eyeImages') {
                $meteor.call('getEyeImages', code).then(
                    (data) => {
                        $scope.eyeImages = data;
                        $scope.showProgress = false;
                    }
                );
            }
        }

        // Key press calback used by barcode scanner
        function retrieve () {
            if ($scope.grouping === 'testData') {
                $meteor.call('getTestParameters', [$scope.code]).then(
                    (data) => {
                        $scope.gridOptions.data = data;
                    }
                );
            } else if ($scope.grouping === 'sensitivityCharts') {
                $meteor.call('getSensitivityData', $scope.code).then(
                    (data) => {
                        initSensitivityCharts(data);
                    }
                );
            } else {
                findTransceiver($scope.code);
            }
            $scope.tr = '';
        }

        $scope.openImage = function (eye, $event) {
            $mdDialog.show({
                controller: 'GalleryDialogController',
                templateUrl: 'imports/ui/components/transceiver-view/gallery-dialog.tmpl.html',
                clickOutsideToClose: true,
                focusOnOpen: false,
                targetEvent: $event,
                locals: {
                    eye: eye
                }
            });
        };

        $scope.export = () => {
            $meteor.call('getTestParameters', [$scope.code]).then(
                (data) => {
                    let ret = '';
                    _.each(data, (item) => {
                        let row = '';
                        let head = '';
                        head += 'SerialNumber,';
                        row += item.SerialNumber + ',';
                        head += 'SetTemperature_C,';
                        row += item.SetTemperature_C + ',';
                        head += 'Channel,';
                        row += item.Channel + ',';
                        head += 'Er_in_dB,';
                        row += item.Er_in_dB + ',';
                        head += 'MM_in_percent,';
                        row += item.MM_in_percent + ',';
                        head += 'OMA_in_dBm,';
                        row += item.OMA_in_dBm + ',';
                        head += 'Pavg_in_dBm,';
                        row += item.Pavg_in_dBm + ',';
                        head += 'Sensitivity_dBm,';
                        row += item.Sensitivity_dBm + ',';
                        if (ret === '') {
                            ret += ',' + head + '\n';
                        }
                        ret += row + '\n';
                    });
                    let a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style.display = 'none';
                    a.href = encodeURI('data:text/csv;' + ret);
                    a.download = 'exports.csv';
                    a.click();
                }
            );
        };

    }
]);

