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
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', '$timeout', 'ExportDataService',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $mdDialog, $location, $window,
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

        $scope.exportClicked = function () {
            $scope.showProgress = true;
            Meteor.call('exportData', $scope.serial, [$scope.testType], $scope.partNumber, $scope.dateFrom,
                $scope.dateTo, $scope.errorStatus,
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
                            let blob = new Blob([cvsdata.substring(1)], {type: 'data:text/csv'});
                            $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
                            $scope.filename = $scope.partNumber + '_' + $scope.testType + '.csv';
                            setTimeout(() => {
                                let a = document.getElementById('dataexportlink');
                                $scope.showProgress = false;
                                a.click();
                            }, 500);
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
