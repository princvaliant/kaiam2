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
.controller('LockController', ['$scope', '$state', function ($scope, $state) {
    $scope.user = {
        name: 'Morris Onions',
        email: 'info@oxygenna.com',
        password: 'demo'
    };

    // controller to handle login check
    $scope.loginClick = function() {
        // user logged in ok so goto the dashboard
        $state.go('admin-panel.default.dashboard-general');
    };


    $scope.logoutClick = function() {
        // go back to login screen
        $state.go('public.auth.login');
    };
}]);
