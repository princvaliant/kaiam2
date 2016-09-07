'use strict';
import angular from 'angular';
import {Meteor} from 'meteor/meteor';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSettings').controller('SettingsUserController', ['$timeout', '$translate', '$rootScope', '$scope',
    '$mdToast', '$window', '$mdDialog', 'entity',
    function ($timeout, $translate, $rootScope, $scope,
              $mdToast, $window, $mdDialog, entity) {
        $scope.entity = _.clone(entity);
        $scope.roles = ScesSettings.internalRoles.sort();
        $scope.selected = _.clone($scope.entity.profile.roles);
        $scope.entity.profile = {};
        $scope.entity.profile.company = entity.profile.company;
        $scope.entity.profile.isClient = entity.profile.isClient;


        $scope.toggle = function (item, list) {
            let idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
        };

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };

        $scope.submit = function () {
            Meteor.call('updateUser', $scope.entity, $scope.selected, (err, result) => {
                if (!err) {
                    showError($translate.instant('SETTINGS.USER_UPDATED'));
                    $mdDialog.cancel();
                } else {
                    showError(err);
                }
            });
        };

        $scope.closeClick = function () {
            $mdDialog.cancel();
        };

        function showError(err) {
            $mdToast.show(
                $mdToast.simple()
                    .content(err)
                    .position('bottom right')
                    .hideDelay(3000));
        }
    }
]);
