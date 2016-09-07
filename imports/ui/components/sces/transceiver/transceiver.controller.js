'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '../sces.service';
/**
 * @ngdoc function
 * @name ScesTransceiverController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesTransceiverController', [
    '$rootScope', '$scope', '$log', '$meteor', '$location', '$translate', '$translatePartialLoader',
    ($rootScope, $scope, $log, $meteor, $location, $translate, $translatePartialLoader) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        let unitId = $location.search().id;

        if (unitId) {
            $scope.showImport = false;
            Meteor.call('getDomain', unitId, (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(5000));
                } else {
                    initData(data);
                }
            });
            Meteor.call('getTestdata', unitId, (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(5000));
                } else {
                    initTestData(data);
                }
            });
        }

        $scope.select = function (obj) {
            $scope.selected = obj;
        };

        function initData (domain) {
            $scope.unit = domain;
            $scope.subscribe('domainParents', () => {
                return [domain._id];
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
                salesOrders: () => {
                    return Domains.find({
                        type: 'salesOrder'
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
                },
                rmas: () => {
                    return Domains.find({
                        type: 'rma'
                    }, {
                        sort: {
                            'state.when': -1
                        }
                    });
                },
                locations: () => {
                    return Domains.find({
                        type: 'location'
                    }, {
                        sort: {
                            'state.when': -1
                        }
                    });
                }
            });
        }

        function initTestData (testdata) {
            $scope.testdata = _.groupBy(testdata, (o) => {
                return o.mid.toUpperCase();
            });
        }
    }
]);
