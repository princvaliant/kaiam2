'use strict';

import angular from 'angular';
import './export-data.service';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamExportData').controller('ExportdataController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$mdDialog', '$location', '$window', '$document',
    '$translate', '$translatePartialLoader', '$timeout', 'ExportDataService',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $mdDialog, $location, $window, $document,
     $translate, $translatePartialLoader, $timeout, ExportDataService) => {
        $translatePartialLoader.addPart('exportdata');
        $translate.refresh();

        $scope.partNumbers = _.keys(Settings.partNumbers);
        $scope.partNumber = $cookies.get('exportDataPartNumber') || $scope.partNumbers[0];
        $scope.errorStatuses = ['ALL', 'P', 'F'];
        $scope.errorStatus = $cookies.get('exportDataErrorStatus') || $scope.errorStatuses[0];
        $scope.showProgress = false;
        $scope.dateTo = moment().toDate();
        $scope.dateFrom = moment().subtract(4, 'days').toDate();
        $scope.ignoreDate = true;
        $scope.ignorePartNumber = true;
        $scope.exportLast = false;

        initTest();
        $scope.onChangePartNumber = function (pn) {
            $cookies.put('exportDataPartNumber', pn);
            $scope.partNumber = pn;
            initTest();
        };
        $scope.onChangeErrorStatus = function (es) {
            $cookies.put('exportDataErrorStatus', es);
            $scope.errorStatus = es;
        };
        $scope.exportDetailsClicked = function (val) {
            $scope.exportDetails = val;
        };
        $scope.ignoreDateClicked = function (val) {
            $scope.ignoreDate = val;
        };
        $scope.ignorePartNumberClicked = function (val) {
            $scope.ignorePartNumber = val;
        };
        $scope.exportLastClicked = function (val) {
            $scope.exportLast = val;
        };
        $scope.exportTosaClicked = function (val) {
            $scope.exportTosa = val;
        };
        $scope.exportRosaClicked = function (val) {
            $scope.exportRosa = val;
        };

        $scope.exportClicked = function () {
            $scope.showProgress = true;
            Meteor.call('exportData', $scope.serial, [$scope.testType], $scope.partNumber, $scope.dateFrom,
                $scope.dateTo, $scope.errorStatus, $scope.ignorePartNumber, $scope.ignoreDate, $scope.exportLast,
                $scope.exportTosa, $scope.exportRosa,
                (err, data) => {
                    if (err) {
                        showError(err);
                    } else {
                        if (data.length === 0) {
                            showError('NO DATA RETURNED');
                            $scope.showProgress = false;
                        } else {
                            if ($scope.testType === 'ALL - ALL') {
                                $scope.exportDetails = false;
                                data = ExportDataService.convertToRows(data, $scope.partNumber);
                            }
                            let cvsdata = ExportDataService.exportData(data, $scope.exportDetails, $scope.partNumber);
                            let blob = new Blob([cvsdata.substring(1)], {type: 'data:text/csv;charset=utf-8'});
                            $scope.filename = $scope.partNumber + '_' + $scope.testType + '.csv';
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
                    }
                });
        };

        function initTest() {
            $scope.testTypes = _.extend(Settings.getTestConfigForPartNumber($scope.partNumber).sort(), ['ALL - ALL']);
            $scope.testType = 'ALL - ALL';
        }

        function showError(err) {
            $mdToast.show(
                $mdToast.simple()
                    .content($translate.instant('Export data error') + ' ' + err)
                    .position('top right')
                    .hideDelay(5000));
        }
    }
]);
