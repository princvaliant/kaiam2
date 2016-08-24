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
angular.module('kaiamSces').
controller('ScesTransceiverController', [
  '$rootScope', '$scope', '$log', '$meteor', '$location', '$translate', '$translatePartialLoader', ($rootScope, $scope, $log, $meteor, $location, $translate, $translatePartialLoader) => {
    $translatePartialLoader.addPart('sces');
    $translate.refresh();
    let unitId = $location.search().id;

    if (unitId) {
      $scope.showImport = false;
      $meteor.call('getDomain', unitId).then(
        (data) => {
          initData(data);
        }
      );
      $meteor.call('getTestdata', unitId).then(
        (data) => {
          initTestData(data);
        }
      );
    }

    $scope.select = function(obj) {
      $scope.selected = obj;
    };

    function initData(domain) {
      $scope.unit = domain;
      $scope.$meteorSubscribe('domainParents', domain._id);
      $scope.shipments = $scope.$meteorCollection(function() {
        return Domains.find({
          type: 'shipment'
        }, {
          sort: {
            'state.when': -1
          }
        });
      });
      $scope.salesOrders = $scope.$meteorCollection(function() {
        return Domains.find({
          type: 'salesOrder'
        }, {
          sort: {
            'state.when': -1
          }
        });
      });
      $scope.trays = $scope.$meteorCollection(function() {
        return Domains.find({
          type: 'tray'
        }, {
          sort: {
            'state.when': -1
          }
        });
      });
      $scope.rmas = $scope.$meteorCollection(function() {
        return Domains.find({
          type: 'rma'
        }, {
          sort: {
            'state.when': -1
          }
        });
      });
    }

    function initTestData(testdata) {
      $scope.testdata = _.groupBy(testdata, (o) => {
        return o.mid.toUpperCase();
      });
    }
  }
]);
