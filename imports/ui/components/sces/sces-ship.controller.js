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
angular.module('kaiamSces').controller('ScesShipController', [
    '$scope', '$state', '$log', '$timeout', '$window', '$mdToast', '$meteor', '$mdDialog', '$location', '$translate',
    '$translatePartialLoader', 'ScesService', ($scope, $state, $log, $timeout, $window, $mdToast, $meteor, $mdDialog, $location, $translate,
                                               $translatePartialLoader, ScesService) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        let keys = '';
        $scope.shipId = $location.search().id;
        $scope.selectedOrders = [];
        $scope.openOrders = [];
        $scope.searchText = '';
        $scope.selectedIndex = 0;
        $scope.domainKids = [];
        $scope.content = 'log';

        // This part provides order select functionality for new shipment ////////////////////
        if (!$scope.shipId) {
            let columnDefs = ScesSettings.columnsCommon.concat(ScesSettings.columns['salesOrder']);
            _.each(columnDefs, (elem) => {
                _.extend(elem, {sortDirectionCycle: ['asc', 'desc']});
            });
            let fields = _.object(_.pluck(columnDefs, 'field'), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
            $scope.$watch('search', _.debounce(function (search) {
                // This code will be invoked after 1 second from the last time 'id' has changed.
                $scope.$apply(function () {
                    $scope.so = null;
                    $scope.searchDebounce = search;
                });
            }, 300));
            $scope.gridOptions = {
                enableRowSelection: true,
                multiSelect: false,
                columnDefs: columnDefs,
                data: [],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, (row) => {
                        $scope.so =  row.isSelected ? row.entity : null;
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
            $scope.autorun(() => {
                Meteor.call('getOpenSalesOrders', {
                        fields: fields,
                        limit: 20,
                        sort: $scope.getReactively('sort')
                    },
                    $scope.getReactively('searchDebounce') || '',
                    'salesOrder', (err, list) => {
                        $scope.gridOptions.data = list;
                        $scope.gridApi.grid.refresh();
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
                $meteor.call('createDomain', 'shipment', null, [$scope.so._id], null, [$scope.so.dc['Name (Sold-To)']]).then(
                    function (domainId) {
                        $scope.shipId = domainId;
                        $state.transitionTo('triangular.sces.shipment', {
                            id: domainId
                        });
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
            }
        };

        $scope.cancelClicked = function () {
            $state.go('triangular.sces.tab.shipment');
        };
        /////////////////////////////////////////////////////////////////////////////////////

        // This part provides functionality for existing shipment ///////////////////////////
        $meteor.autorun($scope, function () {
            // If shipId changes subscribe to all data related to this shipment
            if ($scope.getReactively('shipId')) {
                $scope.$meteorSubscribe('domainById', $scope.shipId).then(function () {
                    $scope.isNewShipment = false;
                    // Populate shipment object from publication
                    $scope.domain = $scope.$meteorCollection(function () {
                        return Domains.find({
                            _id: $scope.getReactively('shipId')
                        });
                    })[0];
                    // Initiate barcode image
                    $scope.barcodeimg = JsBarcode($scope.shipId);
                    //Set focus on radio group so scanner will work immidiatelly
                    $timeout(function () {
                        let element = $window.document.getElementById('shipScanOptions');
                        if (element) {
                            element.focus();
                        }
                    });
                });
                // Retrieve all orders associated with this shipment
                $scope.$meteorSubscribe('domainParents', $scope.shipId).then(function () {
                    $scope.domainParents = $scope.$meteorCollection(function () {
                        return Domains.find({
                            _id: {
                                $in: $scope.domain.parents
                            }
                        });
                    });
                    $scope.selectedOrder = $scope.domainParents[0];
                    refresh();
                });
                // Retrieve all events
                $scope.$meteorSubscribe('domainEvents', $scope.shipId)
                    .then(function () {
                        $scope.domainEvents = $scope.$meteorCollection(function () {
                            return DomainEvents.find({}, {
                                sort: {
                                    when: -1
                                }
                            });
                        });
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
                $meteor.call('submitShipment', $scope.domain).then(
                    function () {
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
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
            if ($scope.domain.canEdit()) {
                if (newValue) {
                    if ($scope.scanadd) {
                        // If 'scan to add' radio button or manual add
                        $meteor.call('addToShipment', newValue, $scope.domain, $scope.selectedOrder, $scope.remainingOnOrder).then(
                            function () {
                                refresh();
                            },
                            function (err) {
                                showError(err.error);
                            }
                        );
                    }
                    if ($scope.scanremove) {
                        // If 'scan to remove' radio button
                        $meteor.call('removeFromShipment', newValue, $scope.domain, $scope.selectedOrder).then(
                            function () {
                                refresh();
                            },
                            function (err) {
                                showError(err.error);
                            }
                        );
                    }
                }
            }
        }

        $scope.printDiv = function (divName) {
            ScesService.printBarcode(window, document, divName, 'shipment', $scope.domainKids.length);
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

        function refresh () {
            if ($scope.selectedOrder) {
                $meteor.call('getShippedQty', $scope.selectedOrder._id, $scope.selectedOrder.state.when).then(
                    function (count) {
                        $scope.remainingOnOrder = $scope.selectedOrder.dc['Qty Ordered'] - count;
                    });
            }
            // Retrieve all kids
            let options = {
                fields: {
                    _id: 1,
                    type: 1,
                    'dc.ContractManufacturer': 1,
                    parents: 1
                }
            };
            $scope.$meteorSubscribe('domainKids', 'transceiver', $scope.shipId, options)
                .then(function () {
                    $scope.domainKids = $scope.$meteorCollection(function () {
                        return Domains.find({
                            type: 'transceiver',
                            parents: $scope.shipId
                        }, {
                            sort: {
                                when: -1
                            }
                        });
                    });
                    $scope.transceivers = _.groupBy($scope.domainKids, (o) => {
                        return o.dc.ContractManufacturer;
                    });
                });
        }

        // Display toast error in top right corner
        function showError (err) {
            $mdToast.show(
                $mdToast.simple()
                    .content($translate.instant('SCES.' + err))
                    .position('top right')
                    .hideDelay(5000));
        }

        /////////////////////////////////////////////////////////////////////////////////////
    }
]);
