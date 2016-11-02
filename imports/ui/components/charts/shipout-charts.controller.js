'use strict';

import angular from 'angular';
import './shipout-charts.service';

/**
 * @ngdoc controller
 * @name PackoutChartsController
 * @module KaiamApp
 * @kind function
 * @description
 * Packout charts controller
 */


angular.module('kaiamCharts').controller('ShipoutChartsController', [
    '$scope', '$mdToast', '$reactive', '$stateParams', '$cookies', '$location', 'ShipoutChartsService', ($scope, $mdToast, $reactive, $stateParams, $cookies, $location, ShipoutChartsService) => {
        // $reactive(this).attach($scope);
        $scope.company = '-all-';
        $scope.companies = ['-all-'];
        $scope.interval = $cookies.get('shipoutInterval') || 'Daily';
        $scope.device = $cookies.get('shipoutDevice') || '40GB';
        let listOfSerials = [];

        // Event handler when company changed
        $scope.changeCompany = (company) => {
            $scope.company = company;
            $scope.widgetCtrl.setLoading(true);
            processRows();
        };
        $scope.changeInterval = (interval) => {
            $scope.interval = interval;
            $cookies.put('shipoutInterval', interval);
            $scope.widgetCtrl.setLoading(true);
            processRows();
        };
        $scope.changeDevice = (device) => {
            $scope.device = device;
            $cookies.put('shipoutDevice', device);
            $scope.widgetCtrl.setLoading(true);
            processRows();
        };

        processRows();


        // Event handler when export clicked
        $scope.exportClick = () => {
            exportData($scope.shipouts, 'all');
        };

        function processRows () {
            $scope.charts = null;
            $scope.chartsObjs = null;
            Meteor.call('shipouts', $scope.device, $scope.company,
                (err, shipouts) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content(err)
                                .position('bottom right')
                                .hideDelay(3000));
                        $scope.widgetCtrl.setLoading(false);
                    } else {
                        if (shipouts.length === 0) {
                            $scope.chartsObjs = new CanvasJS.Chart('shipoutChart', {});
                            $scope.widgetCtrl.setLoading(false);
                        } else {
                            $scope.shipouts = shipouts;
                            listOfSerials = [];
                            _.each(shipouts, (shipout) => {
                                listOfSerials = listOfSerials.concat(shipout._id);
                                processRow(shipout);
                            });
                            if ($scope.company === '-all-') {
                                $scope.companies = $scope.charts.companies;
                            }
                            initData();
                        }
                    }
                });
        }

        function processRow (doc) {
            $scope.charts = ShipoutChartsService.construct(doc, $scope.charts, $scope.company, $scope.interval, () => {
                if ($scope.chartsObjs !== null) {
                    $scope.chartsObjs.render();
                }
            }, (dp, label) => {
                exportData(dp, label);
            });
        }

        function initData() {
            setTimeout(() => {
                $scope.widgetCtrl.setLoading(false);
                if ($scope.charts !== null) {
                    $scope.charts.data = _.sortBy($scope.charts.data, 'legendText');
                    if (document.querySelector('#shipoutChart') !== null) {
                        $scope.chartsObjs = new CanvasJS.Chart('shipoutChart', $scope.charts);
                        $scope.chartsObjs.render();
                    }
                }
                $scope.chartsObjs.render();
            }, 300);
        }

        function exportData (list, label) {
            let ret = '';
            _.each( list, (item) => {
                let row = '';
                let head = '';
                for (let v in item) {
                    if (v === 'id') {
                        for (let v2 in item[v]) {
                            head = v2 + ',' + head;
                            row = item[v][v2] + ',' + row;
                        }
                    } else {
                        head = v + ',' + head;
                        row = item[v] + ',' + row;
                    }
                }
                if (ret === '') {
                    ret += ',' + head + '\n';
                }
                ret += row + '\n';
            });

            let a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = encodeURI('data:text/csv;' + ret);
            a.download = 'shipouts-' + label + '.csv';
            a.click();
        }
    }
]);
