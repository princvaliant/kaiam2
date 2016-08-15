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
            // user logged in ok so goto the dashboard
            if (Meteor.user().profile.isClient === 'Y') {
                $state.go('triangular.client');
            } else {
                $state.go('triangular.dashboard');
            }
        };


        $scope.logoutClick = function () {
            // go back to login screen
            $state.go('authentication.login');
        };
    }]);
