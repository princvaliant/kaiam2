import angular from 'angular';
import {Meteor} from 'meteor/meteor';

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
                Meteor.loginWithPassword($scope.user.email, $scope.user.password, (err) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Login - ' + err)
                                .position('bottom right')
                                .hideDelay(3000)
                        );
                    } else {
                        $rootScope.$broadcast('event:loginConfirmed');
                        // set default routes when no path specified
                        if (Meteor.user().profile.isClient === 'Y') {
                            $state.go('triangular.client');
                        } else {
                            $state.go('triangular.dashboard');
                        }
                    }
                });
            };
        }
    ]);
