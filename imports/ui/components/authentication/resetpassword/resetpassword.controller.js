'use strict';

import angular from 'angular';
import {Accounts} from 'meteor/accounts-base';
/**
 * @ngdoc function
 * @name ResetPasswordController
 * @module LockController
 * @kind function
 *
 * @description
 *
 * Handles reset password functionality
 *
 */
angular.module('kaiamAuthentication')
    .controller('ResetPasswordController', ['$rootScope', '$state', '$mdToast', '$translate', '$scope', '$stateParams',
        ($rootScope, $state, $mdToast, $translate, $scope, $stateParams) => {
            $scope.resetClick = function () {
                Accounts.resetPassword($stateParams.token, $scope.password, (err) => {
                    if (err === undefined) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Reset password successful')
                                .position('top center')
                                .hideDelay(3000)
                        );
                        $rootScope.$broadcast('event:loginConfirmed');
                        $state.go('authentication.login');
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('Reset password error - ' + err)
                                .position('bottom right')
                                .hideDelay(3000)
                        );
                    }
                });
            };
        }]);
