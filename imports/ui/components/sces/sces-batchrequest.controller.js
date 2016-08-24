'use strict';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSces').
controller('ScesBatchRequestController', [
  '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
  '$translate', '$translatePartialLoader', '$timeout', 'ScesService', ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
    $translate, $translatePartialLoader, $timeout, ScesService) => {
    $translatePartialLoader.addPart('sces');
    $translate.refresh();
    $scope.isNewTray = true;
    $scope.trayTypes = ScesSettings.trayTypes;
    $scope.trayType = $cookies.get('trayType') || $scope.trayTypes[0];
    $scope.partNumbers = _.keys(Settings.partNumbers);
    $scope.partNumber = $cookies.get('trayPartNumber') || $scope.partNumbers[0];
    $scope.scanAction = 'scanadd';
    let keys = '';
    $scope.trayId = $location.search().id;
    $scope.content = 'log';

    // This part provides order select functionality for new tray ////////////////////
    $scope.confirmClicked = function() {
      if ($scope.trayType && $scope.partNumber) {
        $meteor.call('createDomain', 'tray', null, null, {
          type: $scope.trayType,
          pnum: $scope.partNumber
        }, [$scope.partNumber]).then(
          function(domainId) {
            $state.go('triangular.sces.tray', {
              id: domainId
            });
          },
          function(err) {
            showError(err.error);
          }
        );
      }
    };

    $scope.onChangeTrayType = function(trayType) {
      $cookies.put('trayType', trayType);
    };

    $scope.onChangePartNumber = function(partNumber) {
      $cookies.put('trayPartNumber', partNumber);
    };
    /////////////////////////////////////////////////////////////////////////////////////

    // This part provides functionality for existing tray ///////////////////////////
    // Subscribe to domain and domainKids collection
    $meteor.autorun($scope, function() {
      if ($scope.getReactively('trayId')) {
        $scope.$meteorSubscribe('domainById', $scope.trayId).then(function() {
          $scope.domain = $scope.$meteorCollection(function() {
            return Domains.find({
              _id: $scope.trayId
            });
          })[0];
          $scope.barcodeimg = JsBarcode($scope.trayId);
          $scope.isNewTray = false;
          $timeout(function() {
            let element = $window.document.getElementById('trayScanOptions');
            if (element) {
              element.focus();
            }
          });
        });
        $scope.$meteorSubscribe('domainKids', 'transceiver', $scope.trayId).then(function() {
          $scope.domainKids = $scope.$meteorCollection(function() {
            return Domains.find({
              parents: $scope.trayId
            });
          });
        });
        $scope.$meteorSubscribe('domainEvents', $scope.trayId).then(function() {
          $scope.domainEvents = $scope.$meteorCollection(function() {
            return DomainEvents.find({}, {
              sort: {
                when: -1
              }
            });
          });
        });
        $scope.$meteorSubscribe('domainParents', $scope.trayId).then(function() {
          $scope.domainParents = $scope.$meteorCollection(function() {
            return Domains.find({
              _id: {
                $in: $scope.domain.parents
              }
            });
          });
        });
      }
    });

    // On scan add remove callback
    $scope.onScanAdd = function(val) {
      if (!val) {
        $scope.scanadd = true;
      } else {
        $scope.scanremove = false;
      }
    };
    $scope.onScanRemove = function(val) {
      if (!val) {
        $scope.scanremove = true;
      } else {
        $scope.scanadd = false;
      }
    };

    $scope.onRemoveChild = function(domainId) {
      $meteor.call('removeTransceiverFromTray', domainId, $scope.domain).then(
        function() {},
        function(err) {
          showError(err.error);
        }
      );
    };

    $scope.onManualAdd = function() {
      addOrRemove($scope.serial);
      $scope.serial = '';
    };

    function addOrRemove(newValue) {
      if ($scope.domain.canEdit()) {
        if (newValue) {
          if ($scope.scanadd) {
            $meteor.call('addTransceiverToTray', newValue.trim(), $scope.domain).then(
              function() {},
              function(err) {
                showError(err.error);
              }
            );
          }
          if ($scope.scanremove) {
            $meteor.call('removeTransceiverFromTray', newValue.trim(), $scope.domain).then(
              function() {},
              function(err) {
                showError(err.error);
              }
            );
          }
        }
      }
    }

    $scope.printDiv = function(divName) {
      ScesService.printBarcode(window, document, divName, $scope.domain.dc.pnum, $scope.domainKids.length);
    };

    $scope.onKeyPressed = function(e) {
      if (e.which === 13) {
        addOrRemove(keys, false);
        keys = '';
      } else {
        keys += String.fromCharCode(e.which);
      }
    };

    function showError(err) {
      $mdToast.show(
        $mdToast.simple()
        .content($translate.instant('SCES.' + err))
        .position('top right')
        .hideDelay(5000));
    }
  }
]);
