'use strict';

import angular from 'angular';


/**
 * @ngdoc function
 * @name EpromCompareController
 * @module kaiamEprom
 * @kind function
 *
 *
 */
angular.module('kaiamEprom').controller('EpromCompareController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', '$timeout',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader, $timeout) => {
        $translatePartialLoader.addPart('eprom');
        $translate.refresh();
        $scope.pages = [];
        for (let i = 1; i <= 22; i++) {
            $scope.pages.push(i);
        }
        $scope.page = 3;
        $scope.showProgress = false;
        let memory = [0, 0];

        $scope.onSubmit = function (e) {
            e.preventDefault();
            packout($scope.serial1, 0);
            packout($scope.serial2, 1, compare);
            ;
        };

        $scope.pageChange = function (page) {
            $scope.page = page;
        };

        function packout (serial, idx, compFunc) {
            if (!serial) {
                return;
            }
            Meteor.call('getLastPackout', serial,
                (err, data) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content(err)
                                .position('bottom right')
                                .hideDelay(3000));
                    } else {
                        if (!data) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .content('No packout data for serial ' + serial )
                                    .position('bottom right')
                                    .hideDelay(3000));
                        }
                        memory[idx] = data.data.MemoryDump;
                        if(compFunc) {
                            compFunc();
                        }
                    }
                });
        }

        function compare() {



            $scope.memory1 = '1';
            $scope.memory2 = '2';
            $scope.$apply();

        }
    }
]);
