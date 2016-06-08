'use strict';
/**
 * @ngdoc function
 * @name LoginCtrl
 * @module triangular.authentication
 * @kind function
 *
 * @description
 *
 * Handles lock screen login
 *
 */
angular.module('kaiamAuthentication')
  .controller('ResetPasswordController', ['$rootScope', '$state', '$mdToast', '$translate', '$meteor', '$scope', '$stateParams',
    ($rootScope, $state, $mdToast, $translate, $meteor, $scope, $stateParams) => {
    $scope.resetClick = function() {
      $meteor.resetPassword($stateParams.token, $scope.password).then(function() {
        $rootScope.$broadcast('event:loginConfirmed');
        $state.go('admin-panel.default.dashboard');
      }, function(err) {
        $mdToast.show(
          $mdToast.simple()
          .content('Reset password error - ' + err)
          .position('bottom right')
          .hideDelay(3000)
        );
      });
    };
  }]);
