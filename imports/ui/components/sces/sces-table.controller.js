'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesTableController', [
    '$rootScope', '$q', '$scope', '$meteor', '$cookies', '$mdSidenav', '$location', '$stateParams',
    '$translate', '$translatePartialLoader', 'ScesService', ($rootScope, $q, $scope, $meteor, $cookies, $mdSidenav, $location, $stateParams,
                                                             $translate, $translatePartialLoader, ScesService) => {
        // Refresh translator
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        let _subscriptionHandle;
        let domain = $stateParams.domain;
        let columns = ScesSettings.columnsCommon.concat(ScesSettings.columns[domain]);
        $scope.columns = [{
            name: '',
            orderBy: ''
        }].concat(columns);
        $scope.fields = _.object(_.pluck(columns, 'orderBy'), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        let tabs = ScesService.domainFilters($rootScope.currentUser);
        $scope.$parent.selectedTab = tabs.indexOf(domain);

        $scope.search = $cookies.get(domain + 'Search');
        // Get list of create actions for current user
        $scope.createList = ScesService.createList(Meteor.user());
        // Default settings for list table
        $scope.tableProps = ScesService.getTableProps(domain);

        $meteor.autorun($scope, function () {
            $cookies.put(domain + 'Search', $scope.getReactively('search'));
            if (domain === 'transceiver') {
                $scope.domainsCount = 100000;
            } else {
                $meteor.call('getDomainsCount', $scope.search, domain).then(
                    (count) => {
                        $scope.domainsCount = count;
                        if (count < $scope.tableProps.page * $scope.tableProps.limit) {
                            $scope.tableProps.page = 1;
                        }
                    }
                );
            }
        });

        // Reactive data retrieval (subscription) from server
        $meteor.autorun($scope, function () {
            if (_subscriptionHandle) {
                _subscriptionHandle.stop();
            }
            $cookies.put(domain + 'Search', $scope.getReactively('search'));
            $cookies.put(domain + 'Limit', $scope.getReactively('tableProps.limit'));
            $cookies.put(domain + 'Page', $scope.getReactively('tableProps.page'));
            $cookies.putObject(domain + 'Sort', $scope.getReactively('tableProps.sort'));

            $scope.$meteorSubscribe('domains', {
                fields: $scope.getReactively('fields'),
                limit: parseInt($scope.getReactively('tableProps.limit'), 10),
                skip: parseInt(($scope.getReactively('tableProps.page') - 1) * $scope.getReactively('tableProps.limit'), 10),
                sort: $scope.getReactively('tableProps.sort')
            }, $scope.getReactively('search'), domain).then(function (subscriptionHandle) {
                _subscriptionHandle = subscriptionHandle;
                $scope.domains = Domains.find({}, {
                    sort: $scope.getReactively('tableProps.sort')
                }).fetch();
                if (domain === 'salesOrder') {
                    _.each($scope.domains, function(so) {
                        $meteor.call('getShippedQty', so._id, so.state.when).then(
                            function(count) {
                                //   so.dc['Quantity Open'] = so.dc['Quantity Open'] - count;
                                so.dc['Quantity Open'] = so.dc['Qty Ordered'] - count;

                            });
                    });
                }
            });
        });

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


        $scope.onOrderChange = function (order) {
            let dir = 1;
            let _order = order;
            if (_order.substring(0, 1) === '-') {
                dir = -1;
                _order = order.substring(1);
            }
            let s = {};
            s[_order] = dir;
            $scope.tableProps.page = 1;
            $scope.tableProps.sort = s;
        };
    }
]);
