'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '../sces.service';

/**
 * @ngdoc function
 * @name ScesShipmentController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesShipmentController', [
    '$scope', '$state', '$log', '$timeout', '$window', '$mdToast', '$reactive', '$mdDialog', '$location', '$translate',
    '$translatePartialLoader', 'ScesService', ($scope, $state, $log, $timeout, $window, $mdToast, $reactive, $mdDialog, $location, $translate,
                                               $translatePartialLoader, ScesService) => {
        $reactive(this).attach($scope);
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        let keys = '';
        $scope.shipId = $location.search().id;
        let domDef = ScesSettings.getDomainFlowDef('shipment');
        if (domDef) {
            $scope.canAdd = ScesSettings.isInternalMember(Meteor.user(), domDef._start.roles);
        }

        $scope.selectedOrders = [];
        $scope.openOrders = [];
        $scope.searchText = '';
        $scope.selectedIndex = 0;
        $scope.domainKids = [];
        $scope.content = 'log';

        // Initialize sales order grid
        let columnDefs = ScesSettings.columnsCommon.concat(ScesSettings.columns['salesOrder']);
        _.each(columnDefs, (elem) => {
            _.extend(elem, {sortDirectionCycle: ['asc', 'desc']});
        });
        let fields = _.object(_.pluck(columnDefs, 'field'), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        $scope.gridOptions = {
            enableRowSelection: true,
            multiSelect: false,
            columnDefs: columnDefs,
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, (row) => {
                    $scope.so = row.isSelected ? row.entity : null;
                });
                $scope.gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
                    let dir = 1;
                    $scope.so = null;
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
                });
            }
        };

        // This part provides order select functionality for new shipment ////////////////////
        if (!$scope.shipId) {
            $scope.$watch('search', _.debounce(function (search) {
                // This code will be invoked after 1 second from the last time 'id' has changed.
                $scope.$apply(function () {
                    $scope.so = null;
                    $scope.searchDebounce = search;
                });
            }, 300));

            $scope.autorun(() => {
                Meteor.call('getOpenSalesOrders', {
                        fields: fields,
                        limit: 20,
                        sort: $scope.getReactively('sort')
                    },
                    $scope.getReactively('searchDebounce') || '',
                    'salesOrder', (err, list) => {
                        if ($scope.gridOptions) {
                            $scope.gridOptions.data = list;
                            $scope.gridApi.grid.refresh();
                        }
                    }
                );
            });
        }

        $scope.confirmClicked = function () {
            if (!$scope.so) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Please select sales order.')
                        .position('top right')
                        .hideDelay(5000));
            } else {
                Meteor.call('createDomain', 'shipment', null, [$scope.so._id], null, [$scope.so.dc['Name (Sold-To)']], (err, domainId) => {
                    if (err) {
                        showError(err.error);
                    } else {
                        $scope.shipId = domainId;
                        $state.transitionTo('triangular.sces.shipment', {
                            id: domainId
                        });
                    }
                });
            }
        };

        $scope.cancelClicked = function () {
            $state.go('triangular.sces.tab.shipment');
        };
        /////////////////////////////////////////////////////////////////////////////////////

        // This part provides functionality for existing shipment ///////////////////////////
        $scope.autorun(function () {
            // If shipId changes subscribe to all data related to this shipment
            if ($scope.getReactively('shipId')) {
                $scope.subscribe('domainById', () => {
                    return [$scope.shipId];
                });
                $scope.subscribe('domainParents', () => {
                    return [$scope.shipId];
                });
                $scope.subscribe('domainEvents', () => {
                    return [$scope.shipId];
                });
                $scope.subscribe('domainKids', () => {
                    return ['transceiver', $scope.shipId, {
                        fields: {
                            _id: 1,
                            type: 1,
                            'dc.ContractManufacturer': 1,
                            parents: 1
                        }
                    }];
                });
                $scope.barcodeimg = JsBarcode($scope.shipId);
                //Set focus on radio group so scanner will work immidiatelly
                $timeout(function () {
                    let element = $window.document.getElementById('shipScanOptions');
                    if (element) {
                        element.focus();
                    }
                }, 200);
            }
        });

        $scope.autorun(function () {
            let domains = $scope.getReactively('domains');
            if (domains && domains.length > 0) {
                $scope.domain = domains[0];
                $scope.domainParents = Domains.find({
                    _id: {
                        $in: domains[0].parents
                    }
                }).fetch();
                $scope.selectedOrder = $scope.domainParents[0];
                updateRemaining($scope.selectedOrder);
            }
        });

        $scope.autorun(function () {
            let domainKids = $scope.getReactively('domainKids');
            if (domainKids) {
                $scope.transceivers = _.groupBy(domainKids, (o) => {
                    return o.dc.ContractManufacturer;
                });
                updateRemaining($scope.selectedOrder);
            }
        });

        $scope.helpers({
            domains: () => {
                return Domains.find({
                    _id: $scope.getReactively('shipId')
                });
            },
            domainEvents: () => {
                return DomainEvents.find({}, {
                    sort: {
                        when: -1
                    }
                });
            },
            domainKids: () => {
                return Domains.find({
                    type: 'transceiver',
                    parents: $scope.getReactively('shipId')
                }, {
                    sort: {
                        when: -1
                    }
                });
            }
        });

        // On scan add remove callback
        $scope.onScanAdd = function (val) {
            if (!val) {
                $scope.scanadd = true;
            } else {
                $scope.scanremove = false;
            }
        };
        $scope.onScanRemove = function (val) {
            if (!val) {
                $scope.scanremove = true;
            } else {
                $scope.scanadd = false;
            }
        };

        // Tab switch callback
        $scope.tabSelected = function (domainParent) {
            $scope.selectedOrder = domainParent;
        };

        // User uses manual entry for barcode
        $scope.onManualAdd = function () {
            addOrRemove($scope.serial);
            $scope.serial = '';
        };

        $scope.submitShipment = function () {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('SCES.CONFIRM-SEND-SHIPMENT'))
                    .ok($translate.instant('SCES.CONFIRM'))
                    .cancel($translate.instant('SCES.CANCEL'))
            ).then(function () {
                Meteor.call('submitShipment', $scope.domain, (err, result) => {
                    if (err) {
                        showError(err.error);
                    }
                });
            });
        };

        // Initilize tab icon when remainingOnOrder changes
        $scope.$watch('remainingOnOrder', function (newValue) {
            $scope.tabicon = false;
            if (newValue === 0) {
                $scope.tabicon = true;
            }
        });

        // Add or remove tray from this shipmentV2O7VNDXY
        function addOrRemove (newValue) {
            if ($scope.domain && $scope.domain.canEdit()) {
                if (newValue) {
                    if ($scope.scanadd) {
                        // If 'scan to add' radio button or manual add
                        Meteor.call('addToShipment', newValue, $scope.domain, $scope.selectedOrder, $scope.remainingOnOrder, (err) => {
                            if (err) {
                                showError(err.error);
                            }
                        });
                    }
                    if ($scope.scanremove) {
                        // If 'scan to remove' radio button
                        Meteor.call('removeFromShipment', newValue, $scope.domain, $scope.selectedOrder, (err) => {
                            if (err) {
                                showError(err.error);
                            }
                        });
                    }
                }
            }
        }

        $scope.printDiv = function (divName) {
            if ($scope.domainKids) {
                ScesService.printBarcode(window, document, divName, 'shipment', $scope.domainKids.length);
            }
        };

        // Key press calback used by barcode scanner
        $scope.onKeyPressed = function (e) {
            if (e.which === 13) {
                addOrRemove(keys, false);
                keys = '';
            } else {
                keys += String.fromCharCode(e.which);
            }
        };

        // Display toast error in top right corner
        function showError (err) {
            $mdToast.show(
                $mdToast.simple()
                    .content($translate.instant('SCES.' + err))
                    .position('top right')
                    .hideDelay(5000));
        }

        function updateRemaining (salesOrder) {
            if (salesOrder) {
                Meteor.call('getShippedQty', salesOrder._id, (err, count) => {
                    $scope.remainingOnOrder = salesOrder.dc['Qty Ordered'] - count;
                });
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////
    }
]);
