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
controller('ScesOrderController', [
  '$rootScope', '$scope', '$log', '$meteor', '$location', '$translate', '$translatePartialLoader',
  'FileUploader', 'ScesService', ($rootScope, $scope, $log, $meteor, $location, $translate, $translatePartialLoader,
    FileUploader, ScesService) => {
    $translatePartialLoader.addPart('sces');
    $translate.refresh();
    $scope.showImport = true;
    let orderId = $location.search().id;
    $scope.importedMessage = '';
    $scope.trbycmtotal = 0;
    $scope.uploader = new FileUploader();
    $scope.uploader.onAfterAddingFile = function(fileItem) {
      ScesService.readFileAsync(fileItem._file).then(function(fileInputContent) {
        let data = Papa.parse(fileInputContent);
        $meteor.call('importSalesOrders', data.data).then(
          function(imported) {
            $scope.importedMessage = imported + ' ' + $translate.instant('SCES.IMPORTED-SALES-ORDER');
          }
        );
      });
    };

    if (orderId) {
      $scope.showImport = false;
      $meteor.call('getDomain', orderId).then(
        (data) => {
          initData(data);
        }
      );
    }

    $scope.setTotals = function(tr) {
      if (tr) {
        $scope.trbycmtotal += tr.cnt;
      }
    };

    function initData(domain) {
      $scope.children = [];
      $scope.selectedOrder = domain;
      $scope.$meteorSubscribe('domainKids', 'shipment', domain._id);
      $scope.$meteorSubscribe('domainKids', 'tray', domain._id);
      $scope.shipments = $scope.$meteorCollection(function() {
        return Domains.find({
          type: 'shipment'
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
      $scope.ordered = $scope.selectedOrder.dc['Qty Ordered'];
      if ($scope.selectedOrder) {
        $meteor.call('getShippedQty', $scope.selectedOrder._id, $scope.selectedOrder.state.when).then(
          function(count) {
            //  $scope.opened = $scope.selectedOrder.dc['Quantity Open'] - count;
            $scope.opened = $scope.selectedOrder.dc['Qty Ordered'] - count;
          });
      }
      $meteor.call('getTransceiversByCm', $scope.selectedOrder._id).then(
        function(data) {
          $scope.trbycm = data;
        });
    }
  }
]);
