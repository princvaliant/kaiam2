'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';

/**
 * @ngdoc function
 * @name TransceiversController
 * @module kaiamCustomer
 * @kind function
 *
 *
 */
angular.module('kaiamCustomer').controller('TransceiversController', [
    '$rootScope', '$scope', '$log', '$meteor', '$location', '$translate', '$cookies', '$state', '$translatePartialLoader',
    ($rootScope, $scope, $log, $meteor, $location, $translate, $cookies, $state, $translatePartialLoader) => {

        $translatePartialLoader.addPart('customer');
        $translate.refresh();

        $scope.domain = 'transceiver';
        $scope.paging = {
            size: 25,
            num: 1
        };

        // Retrieve search and sort order from cookies
        $scope.search = $cookies.get($scope.domain + 'transceiverssearch') || '';
        $scope.sort = $cookies.getObject($scope.domain + 'transceiverssort') || {'state.when': -1};

        $scope.changeSaleOrder = (saleOrder) => {
            $scope.saleOrder = saleOrder;
            $cookies.put($scope.domain + 'transceiverssaleorder', saleOrder);
        };

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
            paginationPageSizes: [25, 50, 75, 100],
            paginationPageSize: 25,
            useExternalPagination: true,
            useExternalSorting: true,
            showGridFooter: false,
            fastWatch: false,
            columnDefs: columnDefs,
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row) + 1}}</div>'
                });
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.paging = {
                        size: pageSize,
                        num: newPage
                    };
                });
                gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                    if (sortColumns.length === 0) {
                        $scope.sort = null;
                    } else {
                        gridApi.pagination.seek(1);
                        $scope.sort = {};
                        $scope.paging = {
                            num: 1
                        };
                        let s = {};
                        s[sortColumns[0].field] = sortColumns[0].sort.direction === 'asc' ? 1 : -1;
                        $scope.sort = s;
                    }
                });
            },
        };

        $scope.$watch('search', _.debounce(function (search) {
            // This code will be invoked after 300 milliseconds from the last time 'id' has changed.
            $scope.$apply(function () {
                $scope.searchDebounce = search;
            });
        }, 300), true);

        $scope.autorun(() => {
            $scope.gridOptions.totalItems = Meteor.call('getTransceiversTotal',
                $scope.getReactively('searchDebounce'),
                $scope.getReactively('saleOrder'),
                (err, count) => {
                    $scope.gridOptions.totalItems = count;
                }
            );
        });

        $scope.autorun(() => {
            let paging = $scope.getReactively('paging');
            Meteor.call('getTransceivers', {
                    fields: fields,
                    skip: paging.size * (paging.num - 1),
                    limit: paging.size,
                    sort: $scope.getReactively('sort')
                },
                $scope.getReactively('searchDebounce'),
                $scope.getReactively('saleOrder'), (err, list) => {
                    $cookies.put($scope.domain + 'transceiverssearch', $scope.searchDebounce);
                    $cookies.putObject($scope.domain + 'transceiverssort', $scope.sort);
                    $scope.gridOptions.data = list;
                    $scope.gridApi.grid.refresh();
                }
            );
        });

        $scope.autorun(() => {
            Meteor.call('getSaleOrders', (err, list) => {
                $scope.saleOrders = ['-all-'].concat(list);
                $scope.saleOrder =  $cookies.get($scope.domain + 'transceiverssaleorder') ||  '-all-';
            });
        });

        $scope.viewRow = function (grid, row) {
            $state.go('triangular.customer.transceiverdata', {
                id: row.entity.dc.ManufSn || row.entity._id
            });
        };
    }
]);
