'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '../sces.service';
import './location-edit.controller';
import './location-edit.tmpl.html';
import './new-part.controller';
import './new-part.tmpl.html';

/**
 * @ngdoc function
 * @name ScesLocationController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesLocationController', [
    '$scope', '$state', '$log', '$mdSidenav', '$timeout', '$window', '$mdToast', '$reactive', '$mdDialog', '$location', '$translate',
    '$translatePartialLoader', 'ScesService',
    ($scope, $state, $log, $mdSidenav, $timeout, $window, $mdToast, $reactive, $mdDialog, $location, $translate,
     $translatePartialLoader, ScesService) => {
        $reactive(this).attach($scope);
        $translatePartialLoader.addPart('location');
        $translate.refresh();
        let keys = '';
        $scope.locationId = $location.search().id;
        let domDef = ScesSettings.getDomainFlowDef('location');
        if (domDef) {
            $scope.canAdd = ScesSettings.isInternalMember(Meteor.user(), domDef._start.roles);
        }
        $scope.searchText = '';
        $scope.selectedIndex = 0;
        $scope.domainKids = [];
        $scope.content = 'log';
        $scope.isAdmin = ScesSettings.isInternalMember(Meteor.user(), ['ADMIN', 'INVENTORY_SUPERVISOR']);

        // This part provides order select functionality for new shipment ////////////////////
        $scope.confirmClicked = function () {
            if ($scope.name) {
                Meteor.call('createDomain', 'location', null, null, {
                    name: $scope.name,
                    subLocation: $scope.subLocation,
                    description: $scope.description
                }, [$scope.name, $scope.subLocation], (err, domainId) => {
                    if (err) {
                        showError(err.error);
                    } else {
                        $state.go('triangular.sces.location', {
                            id: domainId
                        });
                    }
                });
            }
        };

        $scope.cancelClicked = function () {
            $state.go('triangular.sces.tab.location');
        };
        /////////////////////////////////////////////////////////////////////////////////////

        // This part provides functionality for existing shipment ///////////////////////////
        $scope.autorun(function () {
            // If shipId changes subscribe to all data related to this shipment
            if ($scope.getReactively('locationId')) {
                $scope.subscribe('domainById', () => {
                    return [$scope.locationId];
                });
                $scope.subscribe('domainParents', () => {
                    return [$scope.locationId];
                });
                $scope.subscribe('domainEvents', () => {
                    return [$scope.locationId];
                });
                $scope.subscribe('domainKids', () => {
                    return [['transceiver', 'tray'], $scope.locationId, {
                        fields: {
                            _id: 1,
                            type: 1,
                            dc: 1,
                            state: 1,
                            parents: 1
                        }
                    }, true];
                });
                $scope.barcodeimg = JsBarcode($scope.locationId);
                //Set focus on radio group so scanner will work immidiatelly
                $timeout(function () {
                    let element = $window.document.getElementById('locationScanOptions');
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
            }
        });

        $scope.autorun(function () {
            let domainKids = $scope.getReactively('domainKids');
            if (domainKids) {
                $scope.totalTrays = _.where(domainKids, {type: 'tray'}).length;
                $scope.totalTransceivers = _.where(domainKids, {type: 'transceiver'}).length;
            }
        });

        $scope.helpers({
            domains: () => {
                return Domains.find({
                    _id: $scope.getReactively('locationId')
                });
            },
            domainEvents: () => {
                return DomainEvents.find({}, {
                    sort: {
                        when: -1
                    },
                    limit: 300
                });
            },
            domainKids: () => {
                return Domains.find({
                    'state.parentId': $scope.getReactively('locationId'),
                    type: {$in: ['transceiver', 'tray']}
                }, {
                    sort: {
                        'state.when': -1
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

        // User uses manual entry for barcode
        $scope.onManualAdd = function () {
            addOrRemove($scope.serial);
            $scope.serial = '';
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

        $scope.printDiv = function (divName) {
            if ($scope.domainKids) {
                ScesService.printBarcode(window, document, divName, 'location', $scope.domainKids.length);
            }
        };

        $scope.editLocation = function () {
            $mdDialog.show({
                controller: 'ScesLocationEditController as ctrl',
                templateUrl: 'imports/ui/components/sces/location/location-edit.tmpl.html',
                locals: {
                    entity: $scope.domain
                }
            });
        };

        $scope.deleteLocation = function () {
            if ($scope.domainKids.length > 0) {
                showError('LOCATION-NOT-EMPTY');
                return;
            }
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('SCES.LOCATION-CONFIRM-DELETE'))
                    .ok($translate.instant('SCES.CONFIRM'))
                    .cancel($translate.instant('SCES.CANCEL'))
            ).then(function () {
                Meteor.call('deleteLocation', $scope.domain, (err) => {
                    if (err) {
                        showError(err.error);
                    } else {
                        showError('LOCATION-DELETED');
                        $state.go('triangular.sces.tab.location');
                    }
                });
            });
        };

        $scope.toggle = function (navID) {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });

        };

        function showAddDialog (value) {
            $mdDialog.show({
                controller: 'ScesNewPartController as ctrl',
                templateUrl: 'imports/ui/components/sces/location/new-part.tmpl.html',
                locals: {
                    locationId: $scope.locationId,
                    transceiverId: value
                }
            });
        };

        function add (value) {
            // If 'scan to add' radio button or manual add
            Meteor.call('addToLocation', $scope.locationId, value, (err) => {
                if (err) {
                    showError(err.error);
                }
            });
        };

        // Add or remove tray from this shipmentV2O7VNDXY
        function addOrRemove (newValue) {
            if ($scope.domain && $scope.domain.canEdit()) {
                if (newValue) {
                    if ($scope.scanadd) {
                        Meteor.call('getDomain', newValue, (err, data) => {
                            if (err) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content(err)
                                        .position('bottom right')
                                        .hideDelay(5000));
                            } else {
                                if (!data) {
                                    // If this transceiver does not exist
                                    Meteor.call('createPartAndAddToLocation', $scope.locationId, {_id: newValue}, (err2, retId) => {
                                        if (!err2) {
                                            $mdToast.show(
                                                $mdToast.simple()
                                                    .content('Transceiver ' + retId + ' created and added to location')
                                                    .position('top right')
                                                    .hideDelay(3000));
                                            $mdDialog.cancel();
                                        } else {
                                            $mdToast.show(
                                                $mdToast.simple()
                                                    .content(err2)
                                                    .position('bottom right')
                                                    .hideDelay(3000));
                                        }
                                    });
                                    // showAddDialog(newValue);
                                } else {
                                    add(newValue);
                                }
                            }
                        });
                    }
                    if ($scope.scanremove) {
                        // If 'scan to remove' radio button
                        Meteor.call('removeFromLocation', $scope.locationId, newValue, (err) => {
                            if (err) {
                                showError(err.error);
                            }
                        });
                    }
                }
            }
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
