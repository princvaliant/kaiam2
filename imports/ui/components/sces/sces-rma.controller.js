'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';

/**
 * @ngdoc function
 * @name RmaViewController
 * @module kaiamRma
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesRmaController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', '$timeout', 'ScesService', 'Upload',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader, $timeout, ScesService, Upload) => {
        $translatePartialLoader.addPart('rma');
        $translate.refresh();
        $scope.isNewRma = true;
        $scope.showMessage = false;
        $scope.serial = '';
        let keys = '';
        $scope.rmaId = $location.search().id;
        $scope.tab1Label = "Transceivers";
        $scope.tab2Label = "Action log";
        $scope.tab3Label = "Report files";

        // This part provides functionality for existing rma ///////////////////////////
        // Subscribe to domain and domainKids collection
        $meteor.autorun($scope, function () {
            if ($scope.getReactively('rmaId')) {
                $scope.$meteorSubscribe('domainById', $scope.rmaId).then(function () {
                    $scope.domain = $scope.$meteorCollection(function () {
                        return Domains.find({
                            _id: $scope.rmaId
                        });
                    })[0];
                    $scope.barcodeimg = JsBarcode($scope.rmaId);
                    $scope.isNewRma = false;
                    $timeout(function () {
                        let element = $window.document.getElementById('rmaScanOptions');
                        if (element) {
                            element.focus();
                        }
                    });
                });
                $scope.$meteorSubscribe('domainKids', 'transceiver', $scope.rmaId).then(function () {
                    $scope.domainKids = $scope.$meteorCollection(function () {
                        return Domains.find({
                            parents: $scope.rmaId
                        });
                    });
                });
                $scope.$meteorSubscribe('domainFiles', $scope.rmaId).then(function () {
                    $scope.domainFiles = $scope.$meteorCollection(function () {
                        return DomainFiles.find();
                    });
                });
                $scope.$meteorSubscribe('domainEvents', $scope.rmaId).then(function () {
                    $scope.domainEvents = $scope.$meteorCollection(function () {
                        return DomainEvents.find({}, {
                            sort: {
                                when: -1
                            }
                        });
                    });
                });
                $scope.$meteorSubscribe('domainParents', $scope.rmaId).then(function () {
                    $scope.domainParents = $scope.$meteorCollection(function () {
                        return Domains.find({
                            _id: {
                                $in: $scope.domain.parents
                            }
                        });
                    });
                });
            }
        });

        $scope.uploadFiles = function (files) {
            $scope.files = files;
            $scope.showProgress = true;
            angular.forEach(files, function (file) {
                if (file && !file.$error) {
                    Upload.dataUrl(file, true).then(function (data) {
                        if (data.length > 15900000) {
                            showError('Maximum allowed file size is 16MB (' + file.name + ')');
                        } else {
                            $meteor.call('saveDomainFile', $scope.rmaId, data, data.length, file.name).then(
                                function () {
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content('File ' + file.name + ' uploaded')
                                            .position('top left')
                                            .hideDelay(3000));
                                },
                                function (err) {
                                    showError(err.error);
                                }
                            );
                        }
                    });
                }

            });
            $scope.showProgress = false;
        };

        $meteor.autorun($scope, function () {
            if ($scope.getReactively('filename')) {
                let a = document.getElementById('rmaexportlink');
                a.click();
            }
        });
        
        $scope.downloadFile = function (domainFile) {
            $meteor.call('getDomainFile', domainFile._id).then(
                function (domainFile) {
                    var blob = Settings.dataURItoBlob(domainFile.content);
                    $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );
                    $scope.filename = domainFile.fileName;
                },
                function (err) {
                    showError(err.error);
                }
            );
        };

        $scope.approveRma = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to approve return request?')
                .ariaLabel('Approve return request')
                .ok('Approve')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $meteor.call('moveRma', $scope.rmaId, 'Approved', $scope.actionComment).then(
                    function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Return request approved')
                                .position('top left')
                                .hideDelay(5000));
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
            });
        };

        $scope.declineRma = function () {
            if (!$scope.actionComment) {
                showError('DECLINE-REASON');
                return;
            }
            let confirm = $mdDialog.confirm()
                .title('Would you like to decline return request?')
                .ariaLabel('Decline return request')
                .ok('Decline')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $meteor.call('moveRma', $scope.rmaId, 'Declined', $scope.actionComment).then(
                    function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .content("Return request declined")
                                .position('top left')
                                .hideDelay(5000));
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
            });
        };

        $scope.receiveRma = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to mark this return request as received?')
                .ariaLabel('Receive return request')
                .ok('Received')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $meteor.call('moveRma', $scope.rmaId, 'Processing', $scope.actionComment).then(
                    function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Return request received')
                                .position('top left')
                                .hideDelay(5000));
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
            });
        };

        $scope.shipRma = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to mark this return request as shipped?')
                .ariaLabel('Ship return request')
                .ok('Ship')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $meteor.call('moveRma', $scope.rmaId, 'Shipped', $scope.actionComment).then(
                    function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Return request shipped')
                                .position('top left')
                                .hideDelay(5000));
                    },
                    function (err) {
                        showError(err.error);
                    }
                );
            });
        };

        $scope.onImport = function () {
            $mdDialog.show({
                controller: 'RmaImportController',
                templateUrl: 'client/modules/rma/rma-import.tmpl.ng.html',
                clickOutsideToClose: true,
                locals: {
                    rmaId: $scope.rmaId
                }
            });
        };

        $scope.getShipDate = function(tr) {
            let ret;
            _.each(tr.audit, (evt) => {
                if (evt.id === 'AddedToOrder') {
                    ret = evt.when;
                }
            });
            return ret;
        };

        $scope.printDiv = function (divName) {
            ScesService.printBarcode(window, document, divName, '', $scope.domainKids.length);
        };

        function showError(err) {
            $mdToast.show(
                $mdToast.simple()
                    .content($translate.instant(err))
                    .position('top right')
                    .hideDelay(5000));
        }
    }
]);
