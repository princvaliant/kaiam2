'use strict';

import angular from 'angular';

/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSettings').controller('SettingsPartNumbersController', ['$reactive', '$mdDialog', '$q', '$scope', '$cookies', '$mdSidenav',
    '$location', '$translate', '$translatePartialLoader', ($reactive, $mdDialog, $q, $scope, $cookies, $mdSidenav,
                                                           $location, $translate, $translatePartialLoader) => {
        // $reactive(this).attach($scope);
        $translatePartialLoader.addPart('settings');
        $translate.refresh();

        let columnDefs = [{
            field: 'name',
            headerName: 'Part#',
            enableFiltering: true,
            width: 100
        }, {
            headerName: 'Color',
            field: 'color',
            enableFiltering: false,
            width: 100
        }, {
            headerName: 'Device',
            field: 'device',
            enableFiltering: true,
            width: 120
        }, {
            headerName: 'Product',
            field: 'product',
            enableFiltering: true,
            width: 120
        }, {
            headerName: 'Primary?',
            field: 'primary',
            enableFiltering: true,
            width: 120
        }, {
            headerName: 'Calc?',
            field: 'calc',
            enableFiltering: true,
            width: 120
        }];

        $scope.gridOptions = {
            enableGridMenu: false,
            enableCellEditOnFocus: true,
            enableSorting: true,
            noUnselect: true,
            multiSelect: false,
            enableFiltering: true,
            enableRowSelection: false,
            columnDefs: columnDefs,
            onRegisterApi: (gridApi) => {
                $scope.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, (row) => {
                    row.primary = (row.primary && row.primary.toString() === 'true') ? true : false;
                    row.calc = (row.calc && row.calc.toString() === 'true') ? true : false;
                    PartNumbers.update({
                        _id: row._id
                    }, {
                        $set: {
                            name: row.name,
                            color: row.color,
                            device: row.device,
                            product: row.product,
                            primary: row.primary,
                            calc: row.calc
                        }
                    });
                });
            }
        };
        $scope.addClick = () => {
            PartNumbers.insert({
                name: '',
                device: '100GB'
            });
        };

        $scope.subscribe('partNumbers');
        $scope.helpers({
            partNumbers: () => {
                return PartNumbers.find();
            }
        });
        $scope.autorun(() => {
            $scope.gridOptions.data = $scope.getReactively('partNumbers');
        });
    }
]);
