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
angular.module('kaiamSettings').controller('SettingsReworkCodesController', ['$reactive', '$mdDialog', '$q', '$scope', '$cookies', '$mdSidenav',
    '$location', '$translate', '$translatePartialLoader', ($reactive, $mdDialog, $q, $scope, $cookies, $mdSidenav,
                                                           $location, $translate, $translatePartialLoader) => {
        // $reactive(this).attach($scope);
        $translatePartialLoader.addPart('settings');
        $translate.refresh();

        let columnDefs = [{
            field: 'failures',
            headerName: 'Failures',
            enableFiltering: true,
            width: 800
        }, {
            headerName: 'Rework code',
            field: 'rework',
            enableFiltering: true,
            width: 100
        }];

        $scope.gridOptions = {
            enableGridMenu: true,
            enableCellEditOnFocus: true,
            enableSorting: true,
            noUnselect: true,
            multiSelect: false,
            enableFiltering: true,
            enableRowSelection: false,
            columnDefs: columnDefs,
            importerDataAddCallback: (grid, newObjects) => {
                _.each(newObjects, (o) => {
                    ReworkCode.insert(o);
                });
            },
            onRegisterApi: (gridApi) => {
                $scope.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, (row) => {
                    ReworkCode.update({
                        _id: row._id
                    }, {
                        $set: {
                            failures: row.failures,
                            rework: row.rework
                        }
                    });
                });
            }
        };
        $scope.addClick = () => {
            ReworkCode.insert({
                failures: '',
                rework: '-'
            });
        };

        $scope.subscribe('reworkCodes');
        $scope.helpers({
            reworkcodes: () => {
                return ReworkCode.find();
            }
        });
        $scope.autorun(() => {
            $scope.gridOptions.data = $scope.getReactively('reworkcodes');
        });
    }
]);
