import angular from 'angular';
/**
 * @ngdoc function
 * @name LoginController
 * @module kaiamAuthentication
 * @kind function
 *
 * @description
 *
 * Handles login form submission and response
 */
angular.module('kaiamAuthentication')
    .controller('LoginController', ['$rootScope', '$scope', '$state', '$reactive', '$mdToast',
        function ($rootScope, $scope, $state, $reactive, $mdToast) {
            // create blank user variable for login form
            $scope.user = {
                email: '',
                password: ''
            };
            // controller to handle login check
            $scope.loginClick = function () {
                // $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function () {
                //     $rootScope.$broadcast('event:loginConfirmed');
                //     // set default routes when no path specified
                //     if (Meteor.user().profile.isClient === 'Y') {
                //         $state.go('admin-panel.client.home');
                //     } else {
                //         $state.go('admin-panel.default.dashboard');
                //     }
                // }, function (err) {
                //     $mdToast.show(
                //         $mdToast.simple()
                //             .content('Login - ' + err)
                //             .position('bottom right')
                //             .hideDelay(3000)
                //     );
                // });
            };
        }
    ]);
