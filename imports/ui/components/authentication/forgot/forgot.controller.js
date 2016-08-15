'use strict';

import angular from 'angular';
import {Accounts} from 'meteor/accounts-base';

/**
 * @ngdoc function
 * @name ForgotController
 * @module kaiamAuthentication
 * @kind function
 *
 * @description
 *
 * Handles forgot password form submission and response
 */
angular.module('kaiamAuthentication')
    .controller('ForgotController', ['$scope', '$state', '$mdToast', '$filter',
        function ($scope, $state, $mdToast, $filter) {
            // create blank user variable for login form
            $scope.user = {
                email: '',
            };
            // controller to handle login check
            $scope.resetClick = function () {
                Accounts.forgotPassword($scope.user, (err) => {
                    if (err === undefined) {
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
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .content($filter('translate')('FORGOT.MESSAGES.NO_RESET') + ' for ' + $scope.user.email + ' : ' + err.message)
                                .position('bottom right')
                                .hideDelay(5000)
                        );
                    }
                });
            };
        }
    ]);
