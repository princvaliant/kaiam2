/**
 * @ngdoc function
 * @name ForgotController
 * @module triAngularAuthentication
 * @kind function
 *
 * @description
 *
 * Handles forgot password form submission and response
 */
angular.module('kaiamAuthentication')
  .controller('ForgotController', ['$scope', '$meteor', '$state', '$mdToast', '$filter', '$http',
    function ($scope, $meteor, $state, $mdToast, $filter, $http, API_CONFIG) {
      // create blank user variable for login form
      $scope.user = {
        email: '',
      };

      // controller to handle login check
      $scope.resetClick = function () {

        $meteor.forgotPassword({
          email: $scope.user.email
        }).then(function () {
          $mdToast.show(
            $mdToast.simple()
            .content($filter('translate')('FORGOT.MESSAGES.RESET_SENT') + ' ' + $scope.user.email)
            .position('bottom right')
            .action($filter('translate')('FORGOT.MESSAGES.LOGIN_NOW'))
            .highlightAction(true)
            .hideDelay(0)
          ).then(function () {
            $state.go('authentication.login');
          });
        }, function (err) {
          $mdToast.show(
            $mdToast.simple()
            .content($filter('translate')('FORGOT.MESSAGES.NO_RESET') + ' ' + $scope.user.email)
            .position('bottom right')
            .hideDelay(5000)
          );
        });
      };
    }
  ]);
