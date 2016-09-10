'use strict';

import angular from 'angular';
import './gallery-dialog.controller';
import './gallery-dialog.tmpl.html';


/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamTransceiverView').controller('TransceiverViewController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', '$timeout',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader, $timeout) => {
        $translatePartialLoader.addPart('transceiver');
        $translate.refresh();

        let keys = '';
        $scope.code = '';
        $scope.scans = [];
        $scope.showProgress = false;

        // Grouping radio button
        $scope.grouping = $cookies.get('transceiverGrouping') || 'errorCheck';
        $scope.changeGrouping = (grouping) => {
            $cookies.put('transceiverGrouping', grouping);
            $scope.grouping = grouping;
            if ($scope.code) {
                if ($scope.grouping === 'testData') {
                    $meteor.call('getTestdata', $scope.code).then(
                        (data) => {
                            initTestData(data);
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
            }
        };

        $scope.$meteorSubscribe('reworkCodes').then(function () {
        });

        $scope.select = function (obj) {
            $scope.selected = obj;
        };

        function initSensitivityCharts(data) {
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

            setTimeout(function() {
                $scope.sensCharts.forEach((ch) => {
                    if (document.querySelector('#sens' + ch._id) !== null) {
                        let sch = new CanvasJS.Chart('sens' + ch._id, ch);
                        sch.render();
                    }
                });
            }, 200);
        }

        function initTestData(testdata) {
            $scope.testdata = _.groupBy(testdata, (o) => {
                return o.mid.toUpperCase();
            });
        }

        function focus() {
            $timeout(function () {
                let element = $window.document.getElementById('allScanTrans');
                if (element) {
                    element.focus();
                }
            }, 1000);
        }


        function findTransceiver(code) {
            $scope.showProgress = true;
            if ($scope.grouping === 'errorCheck') {
                $meteor.call('getFailedTestdata', code).then(
                    (data) => {
                        let strs = [];
                        _.each(data.data, (o) => {
                            strs.push({failures: {$regex: o.t + '-' + o.st}});
                        });
                        let rework = '-';
                        if (strs.length > 0) {
                            rework = ReworkCode.findOne({
                                $and: strs
                            }, {sort: {failures: 1}});
                            if (rework) {
                                rework = rework.rework;
                            }
                        }
                        if (data.status === 'ERR') {
                            $scope.scans.splice(0, 0, {
                                s: 'E',
                                msg: data.data.length === 0 ? ['Test error'] : '',
                                data: data.data,
                                c: code,
                                pnum: data.pnum
                            });
                        } else if (data.status === 'NOID') {
                            $scope.scans.splice(0, 0, {
                                msg: 'Serial# ' + code + ' does not exist or test did not complete',
                                s: 'F',
                                c: code,
                                pnum: data.pnum
                            });
                        } else if (_.isArray(data.data) && data.data.length > 0) {
                            $scope.scans.splice(0, 0, {
                                data: data.data,
                                pnum: data.pnum,
                                rework: rework
                            });
                        } else {
                            $scope.scans.splice(0, 0, {
                                msg: 'Serial# ' + code + ' last measurement ' + data.data + ' OK',
                                s: 'P',
                                c: code,
                                pnum: data.pnum
                            });
                        }
                        $scope.showProgress = false;
                    }
                );
            } else if ($scope.grouping === 'eyeImages') {
                $meteor.call('getEyeImages', code).then(
                    (data) => {
                        $scope.eyeImages = data;
                        $scope.showProgress = false;
                    }
                );
            }
        }

        focus();

        // Key press calback used by barcode scanner
        $scope.onKeyPressed = function (e) {
            if (e.which === 13) {
                $scope.code = $scope.tr;
                if ($scope.grouping === 'testData') {
                    $meteor.call('getTestdata', $scope.code).then(
                        (data) => {
                            initTestData(data);
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
        };

        $scope.openImage = function(eye, $event) {
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
    }
]);
