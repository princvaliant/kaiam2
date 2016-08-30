'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';


/**
 * @ngdoc function
 * @name ScesSalesorderController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesSalesorderController', [
    '$rootScope', '$scope', '$log', '$mdToast', '$location', '$translate', '$translatePartialLoader',
    'Upload', 'ScesService', ($rootScope, $scope, $log, $mdToast, $location, $translate, $translatePartialLoader,
                              Upload, ScesService) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        $scope.showImport = true;
        let orderId = $location.search().id;
        $scope.importedMessage = '';
        $scope.trbycmtotal = 0;

        $scope.upload = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                ScesService.readFileAsync(resp.config.data.file).then(function (fileInputContent) {
                    let data = Papa.parse(fileInputContent);
                    Meteor.call('importSalesOrders', data.data,
                        (err, imported) => {
                            if (err) {
                                $scope.importedMessage = 'Error status: ' + err;
                            } else {
                                $scope.importedMessage = resp.config.data.file.name + ' successfully uploaded.';
                            }
                        });
                });
            }, function (resp) {
                $scope.importedMessage = 'Error status: ' + resp.status;
            });
        };

        if (orderId) {
            $scope.showImport = false;
            Meteor.call('getDomain', orderId,
                (err, data) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content(err)
                                .position('bottom right')
                                .hideDelay(3000));
                    } else {
                        initData(data);
                    }
                });
        }

        $scope.setTotals = function (tr) {
            if (tr) {
                $scope.trbycmtotal += tr.cnt;
            }
        };

        function initData (domain) {
            $scope.children = [];
            $scope.selectedOrder = domain;

            $scope.subscribe('domainKids', () => {
                return ['shipment', domain._id];
            });
            $scope.subscribe('domainKids', () => {
                return ['tray', domain._id];
            });
            $scope.helpers({
                shipments: () => {
                    return Domains.find({
                        type: 'shipment'
                    }, {
                        sort: {
                            'state.when': -1
                        }
                    });
                },
                trays: () => {
                    return Domains.find({
                        type: 'tray'
                    }, {
                        sort: {
                            'state.when': -1
                        }
                    });
                }
            });
            $scope.ordered = $scope.selectedOrder.dc['Qty Ordered'];
            if ($scope.selectedOrder) {
                Meteor.call('getShippedQty', $scope.selectedOrder._id, (err, count) => {
                    $scope.opened = $scope.selectedOrder.dc['Qty Ordered'] - count;
                });
            }
            Meteor.call('getTransceiversByCm', $scope.selectedOrder._id, (err, data) => {
                $scope.trbycm = data;
            });
        }
    }
]);
