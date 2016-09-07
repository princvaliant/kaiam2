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
angular.module('kaiamSces').controller('ScesNewPartController', ['$timeout', '$translate', '$rootScope', '$scope',
    '$mdToast', '$window', '$mdDialog', 'locationId', 'transceiverId',
    function ($timeout, $translate, $rootScope, $scope,
              $mdToast, $window, $mdDialog, locationId, transceiverId) {
        $scope.partNumbers = _.keys(Settings.partNumbers);
        $scope.locationId = locationId;
        $scope.transceiver = {};
        $scope.transceiver._id = transceiverId;

        $scope.submit = function () {
            Meteor.call('createPartAndAddToLocation', locationId, $scope.transceiver, (err, retId) => {
                if (!err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Tranceiver ' + retId + ' created and added to location')
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
