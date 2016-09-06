'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';
import './view-button.html';
/**
 * @ngdoc function
 * @name ScesTableController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesTableController', [
    '$q', '$scope', '$state', '$cookies', '$mdSidenav', '$location', '$stateParams',
    '$translate', '$translatePartialLoader', 'ScesService',
    ($q, $scope, $state, $cookies, $mdSidenav, $location, $stateParams,
     $translate, $translatePartialLoader, ScesService) => {
        // Refresh translator
        $translatePartialLoader.addPart('sces');
        $translate.refresh();

        let user = Meteor.user();
        $scope.domain = $stateParams.domain;

        // Set domain and allowed to add flag to parent scope (tab controller)
        $scope.$parent.domain = $scope.domain;
        let domDef = ScesSettings.getDomainFlowDef($scope.domain);
        if (domDef) {
            $scope.$parent.canAdd = ScesSettings.isInternalMember(user, domDef._start.roles);
        }
        // Retrieve search and sort order from cookies
        $scope.search = $cookies.get($scope.domain + 'search') || '';
        $scope.sort = $cookies.getObject($scope.domain + 'sort');

        // Retrieve column definitions from settings
        let columnDefs = ScesSettings.columnsCommon.concat(ScesSettings.columns[$scope.domain]);
        _.each(columnDefs, (elem) => {
            _.extend(elem, {sortDirectionCycle: ['asc', 'desc']});
        });
        columnDefs = [{
            field: 'id',
            name: '',
            enableFiltering: false,
            cellTemplate: 'imports/ui/components/sces/view-button.html',
            width: 35
        }].concat(columnDefs);
        let fields = _.object(_.pluck(columnDefs, 'field'), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        $scope.gridOptions = {
            enableFiltering: false,
            showGridFooter: false,
            fastWatch: false,
            columnDefs: columnDefs,
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.core.on.sortChanged($scope, $scope.sortChanged);
            },
        };

        $scope.$watch('search', _.debounce(function (search) {
            // This code will be invoked after 1 second from the last time 'id' has changed.
            $scope.$apply(function () {
                $scope.searchDebounce = search;
            });
        }, 300));

        $scope.sortChanged = function (grid, sortColumns) {
            let dir = 1;
            if (sortColumns.length === 0) {
                $scope.sort = {};
                return;
            } else if (sortColumns[0].sort.direction === 'desc') {
                dir = -1;
            } else if (sortColumns[0].sort.direction === 'asc') {
                dir = 1;
            }
            let s = {};
            s[sortColumns[0].field] = dir;
            $scope.sort = s;
        };

        // Get list of create actions for current user
        $scope.createList = ScesService.createList(user);

        $scope.autorun(() => {
            let method = 'getDomains';
            if ($scope.domain === 'salesOrder') {
                method = 'getOpenSalesOrders';
            }
            $timeout( () => {
                Meteor.call(method, {
                        fields: fields,
                        limit: 200,
                        sort: $scope.getReactively('sort') || {'state.when': -1}
                    },
                    $scope.getReactively('searchDebounce'),
                    $scope.getReactively('domain'), (err, list) => {
                        $cookies.put($scope.domain + 'search', $scope.searchDebounce);
                        $cookies.putObject($scope.domain + 'sort', $scope.sort);
                        $scope.gridOptions.data = list;
                        $scope.gridApi.grid.refresh();
                    }
                );
            });
        });

        $scope.viewRow = function (grid, row) {
            $state.go('triangular.sces.' + $scope.domain.toLowerCase(), {
                id: row.entity._id
            });
        };

        $scope.actions = function (domainType) {
            return ScesSettings.actions[domainType];
        };

        $scope.getValue = function (type, column, dmn) {
            let ret = '';
            let arr = column.split('.');
            if (arr.length === 1) {
                ret = dmn[column];
            } else {
                ret = dmn[arr[0]] ? dmn[arr[0]][arr[1]] : dmn[arr[0]];
            }
            if (type === 'shipment') {
                if (column === 'parents') {
                    ret = '/sces/salesOrder?id=' + ret[0];
                }
            }
            return ret;
        };
    }
]);
