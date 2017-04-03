'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './edit-part.controller';
import './edit-part.tmpl.html';
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
    '$rootScope', '$scope', '$log', '$meteor', '$location', '$translate', '$timeout', '$mdDialog', '$translatePartialLoader',
    ($rootScope, $scope, $log, $meteor, $location, $translate, $timeout, $mdDialog, $translatePartialLoader) => {
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
            Meteor.call('getTestdata', unitId, 'testData', (err, data) => {
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

        $scope.editClicked = function (obj) {
            $mdDialog.show({
                controller: 'ScesEditPartController as ctrl',
                templateUrl: 'imports/ui/components/sces/transceiver/edit-part.tmpl.html',
                locals: {
                    unit: $scope.unit,
                    position: {top: 150, left: 200},
                }
            });
        };

        function initData (domain) {
            $scope.unit = domain;
            $scope.subscribe('domainParents', () => {
                return [domain._id];
            });

            $timeout(() => {
                let locations = [];
                _.each(domain.audit, (aud) => {
                    if (aud.id === 'AddedToLocation') {
                        let dd = Domains.findOne({_id: aud.parentId});
                        if (dd) {
                            locations.push({
                                _id: aud.parentId,
                                name: dd.dc.name,
                                when: aud.when
                            });
                        }
                    }
                });
                $scope.locations = locations;
            }, 1000);

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
