'use strict';

import angular from 'angular';
import { Meteor } from 'meteor/meteor';

/**
 * @ngdoc function
 * @name LockController
 * @module kaiamAuthentication
 * @kind function
 *
 * @description
 *
 * Handles lock screen login
 *
 */
angular.module('kaiamAuthentication')
    .controller('LockController', ['$scope', '$state', function ($scope, $state) {
        // controller to handle login check
        $scope.loginClick = function () {
            $state.go('triangular.dashboard');
            // user logged in ok so goto the dashboard
        };


        $scope.logoutClick = function () {
            // go back to login screen
            $state.go('authentication.login');
        };
    }]);
