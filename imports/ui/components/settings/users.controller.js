'use strict';
import angular from 'angular';
import {Meteor} from 'meteor/meteor';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSettings').controller('SettingsUsersController', ['$reactive', '$mdDialog', '$q', '$scope', '$cookies', '$mdSidenav', '$location',
    '$translate', '$translatePartialLoader',
    ($reactive, $mdDialog, $q, $scope, $cookies, $mdSidenav, $location, $translate, $translatePartialLoader) => {
       // $reactive(this).attach($scope);
        $translatePartialLoader.addPart('settings');
        $translate.refresh();

        let columnDefs = [{
            field: 'id',
            name: '',
            enableFiltering: false,
            cellTemplate: 'imports/ui/components/settings/edit-button.html',
            width: 35
        }, {
            name: 'User name',
            field: 'username',
            width: 150
        }, {
            name: 'Date registered',
            field: 'createdAt',
            type: 'date',
            cellFilter: 'date:"yyyy-MM-dd"',
            width: 120
        }, {
            name: 'Company',
            field: 'profile.company',
            width: 120
        }, {
            name: 'Is customer?',
            field: 'profile.isClient',
            width: 93
        }, {
            name: 'Roles',
            field: 'profile.roles',
            cellFilter: 'rolesFilter',
            width: '60%'
        }];

        $scope.gridOptions = {
            enableSorting: true,
            noUnselect: true,
            multiSelect: false,
            enableFiltering: true,
            enableRowSelection: false,
            columnDefs: columnDefs,
            onRegisterApi: (gridApi) => {
                $scope.gridApi = gridApi;
                // $scope.gridApi.selection.on.rowSelectionChanged($scope, selectionChanged);
            }
        };

        // function selectionChanged(row) {
        //
        // }

        $scope.editRow = (grid, row) => {
            $mdDialog.show({
                controller: 'SettingsUserController as ctrl',
                templateUrl: 'imports/ui/components/settings/user.tmpl.html',
                locals: {
                    entity: row.entity
                }
            });
        };

        $scope.subscribe('users');
        $scope.helpers({
            users: () => {
                return Meteor.users.find();
            }
        });
        $scope.autorun(() => {
            $scope.gridOptions.data = $scope.getReactively('users');
        });

        $scope.getTableStyle = () => {
            let marginHeight = 20; // optional
            let length = 15; // this is unique to my cellTemplate
            return {
                height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight) + 'px'
            };
        };
    }
])
    .filter('rolesFilter', function () {
        return function (value) {
            return value.join(', ');
        };
    });
