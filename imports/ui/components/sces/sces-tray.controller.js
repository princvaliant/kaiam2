'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';
/**
 * @ngdoc function
 * @name ScesTrayController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesTrayController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', '$timeout', 'ScesService', ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
                                                                         $translate, $translatePartialLoader, $timeout, ScesService) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        $scope.trayTypes = ScesSettings.trayTypes;
        $scope.trayType = $cookies.get('trayType') || $scope.trayTypes[0];
        $scope.partNumbers = _.keys(Settings.partNumbers);
        $scope.partNumber = $cookies.get('trayPartNumber') || $scope.partNumbers[0];
        $scope.trayShips = ['', 'RMA'];
        $scope.trayShip = '';
        $scope.scanAction = 'scanadd';
        let keys = '';
        let user = Meteor.users.findOne(Meteor.userId());
        $scope.trayId = $location.search().id;
        let domDef = ScesSettings.getDomainFlowDef('tray');
        if (domDef) {
            $scope.canAdd = ScesSettings.isInternalMember(user, domDef._start.roles);
        }
        $scope.content = 'log';

        $scope.isAdmin = ScesSettings.isAdmin(user);

        // This part provides order select functionality for new tray ////////////////////
        $scope.confirmClicked = function () {
            if ($scope.trayType && $scope.partNumber) {
                Meteor.call('createDomain', 'tray', null, null, {
                    type: $scope.trayType,
                    pnum: $scope.partNumber,
                    isRma: $scope.trayShip === 'RMA'
                }, [$scope.partNumber], (err, domainId) => {
                    if (err) {
                        showError(err.error);
                    } else {
                        $state.go('triangular.sces.tray', {
                            id: domainId
                        });
                    }
                });
            }
        };

        $scope.onChangeTrayType = function (trayType) {
            $cookies.put('trayType', trayType);
        };

        $scope.onChangePartNumber = function (partNumber) {
            $cookies.put('trayPartNumber', partNumber);
        };
        /////////////////////////////////////////////////////////////////////////////////////

        // This part provides functionality for existing tray ///////////////////////////
        // Subscribe to domain and domainKids collection
        $scope.autorun(function () {
            if ($scope.getReactively('trayId')) {
                $scope.subscribe('domainById', () => {
                    return [$scope.trayId];
                });
                $scope.subscribe('domainParents', () => {
                    return [$scope.trayId];
                });
                $scope.subscribe('domainEvents', () => {
                    return [$scope.trayId];
                });
                $scope.subscribe('domainKids', () => {
                    return ['transceiver', $scope.trayId, {
                        fields: {
                            _id: 1,
                            type: 1,
                            parents: 1
                        }
                    }];
                });
                $scope.barcodeimg = JsBarcode($scope.trayId);
                //Set focus on radio group so scanner will work immidiatelly
                $timeout(function () {
                    let element = $window.document.getElementById('trayScanOptions');
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

        $scope.helpers({
            domains: () => {
                return Domains.find({
                    _id: $scope.getReactively('trayId')
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
                    parents: $scope.getReactively('trayId')
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

        $scope.onRemoveChild = function (domainId) {
            Meteor.call('removeTransceiverFromTray', domainId, $scope.domain, (err) => {
                if (err) {
                    showError(err.error);
                }
            });
        };

        $scope.onManualAdd = function () {
            addOrRemove($scope.serial);
            $scope.serial = '';
        };

        $scope.addAnyway = function (newValue) {
            Meteor.call('addTransceiverToTray', newValue.trim(), $scope.domain, true, (err) => {
                if (err) {
                    showError(err.error);
                }
            });
        };

        function addOrRemove (newValue) {
            if ($scope.domain.canEdit()) {
                if (newValue) {
                    if ($scope.scanadd) {
                        Meteor.call('addTransceiverToTray', newValue.trim(), $scope.domain, (err) => {
                            if (err) {
                                showError(err.error);
                            }
                        });
                    }
                    if ($scope.scanremove) {
                        Meteor.call('removeTransceiverFromTray', domainId, $scope.domain, (err) => {
                            if (err) {
                                showError(err.error);
                            }
                        });
                    }
                }
            }
        }

        $scope.printDiv = function (divName) {
            ScesService.printBarcode(window, document, divName, $scope.domain.dc.pnum, $scope.domainKids.length);
        };

        $scope.onKeyPressed = function (e) {
            if (e.which === 13) {
                addOrRemove(keys, false);
                keys = '';
            } else {
                keys += String.fromCharCode(e.which);
            }
        };

        function showError (err) {
            $mdToast.show(
                $mdToast.simple()
                    .content($translate.instant('SCES.' + err))
                    .position('top right')
                    .hideDelay(5000));
        }
    }
]);
