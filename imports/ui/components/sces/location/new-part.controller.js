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
angular.module('kaiamSces').controller('ScesNewPartController', ['$timeout', '$translate', '$rootScope', '$scope', '$cookies',
    '$mdToast', '$window', '$mdDialog', 'locationId', 'transceiverId', 'position',
    function ($timeout, $translate, $rootScope, $scope, $cookies,
              $mdToast, $window, $mdDialog, locationId, transceiverId, position) {
        $scope.partNumbers = _.keys(Settings.partNumbers);
        $scope.locationId = locationId;
        $scope.transceiver = {};
        $scope.manufacturers = ['Rocket', 'Kaiam'];
        $scope.transceiver._id = transceiverId;
        $scope.transceiver.pnum = $cookies.get('partNumberInAssembly') || '';

        $timeout(function () {
            let el = $('md-dialog');
            el.css('position', 'fixed');
            el.css('top', position['top']);
            el.css('right', position['right']);
            $window.document.getElementById('tosaInputId').focus();
        });

        $scope.changePartNumber = (partNumber, ctrl) => {
            $scope.transceiver.pnum = partNumber;
            $cookies.put('partNumberInAssembly', partNumber);
            $timeout(function () {
                $window.document.getElementById(ctrl).focus();
            }, 500);
        };

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
                $timeout(function () {
                    $window.document.getElementById('locationScanOptions').focus();
                }, 1000);
            });
        };

        $scope.onKeyPressed = function (e, ctrl) {
            if (e.which === 13) {
                $window.document.getElementById(ctrl).focus();
            }
        };

        $scope.closeClick = function () {
            $mdDialog.cancel();
            $timeout(function () {
                $window.document.getElementById('locationScanOptions').focus();
            }, 1000);
        };
    }
]);
