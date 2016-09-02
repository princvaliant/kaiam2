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
angular.module('kaiamSces').controller('ScesLocationEditController', ['$timeout', '$translate', '$rootScope', '$scope',
    '$mdToast', '$window', '$mdDialog', 'entity',
    function ($timeout, $translate, $rootScope, $scope,
              $mdToast, $window, $mdDialog, entity) {
        $scope.entity = _.clone(entity.dc);
        $scope.submit = function () {
            Meteor.call('updateLocation', entity._id, $scope.entity, (err) => {
                if (!err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content($translate.instant('SCES.LOCATION-UPDATED'))
                            .position('top right')
                            .hideDelay(3000));
                    $mdDialog.cancel();
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                }
            });
        };

        $scope.closeClick = function () {
            $mdDialog.cancel();
        };
    }
]);
