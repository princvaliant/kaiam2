'use strict';
import angular from 'angular';

/**
 * @ngdoc function
 * @name SettingsCompaniesController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSettings').controller('SettingsCompaniesController', ['$mdDialog', '$q', '$scope', '$reactive', '$cookies', '$mdSidenav',
    '$location', '$translate', '$translatePartialLoader', ($mdDialog, $q, $scope, $reactive, $cookies, $mdSidenav,
                                                           $location, $translate, $translatePartialLoader) => {
        // $reactive(this).attach($scope);
        $translatePartialLoader.addPart('settings');
        $translate.refresh();

        let columnDefs = [{
            field: 'name',
            name: 'Company name',
            enableFiltering: true,
            width: 200
        }, {
            name: 'Client',
            field: 'isClient',
            enableFiltering: true,
            width: 70
        }, {
            name: 'Allowed emails',
            field: 'allowedEmails',
            enableFiltering: true,
            width: 700
        }];

        $scope.gridOptions = {
            enableGridMenu: true,
            enableSorting: true,
            noUnselect: true,
            multiSelect: false,
            enableFiltering: true,
            enableRowSelection: false,
            columnDefs: columnDefs,
            importerDataAddCallback: (grid, newObjects) => {
                _.each(newObjects, (o) => {
                    Companies.insert(o);
                });
            },
            onRegisterApi:  (gridApi) => {
                $scope.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, (row) => {
                    Companies.update({
                        _id: row._id
                    }, {
                        $set: {
                            name: row.name,
                            isClient: row.isClient,
                            allowedEmails: row.allowedEmails
                        }
                    });
                });
            }
        };

        $scope.addClick =  () => {
            Companies.insert({
                name: '',
                isClient: 'Y',
                allowedEmails: ''
            });
        };

        $scope.subscribe('companies');
        $scope.helpers({
            companies: () => {
                return Companies.find();
            }
        });
        $scope.autorun(() => {
            $scope.gridOptions.data = $scope.getReactively('companies');
        });
    }
]);
