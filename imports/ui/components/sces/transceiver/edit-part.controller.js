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
angular.module('kaiamSces').controller('ScesEditPartController', ['$timeout', '$translate', '$rootScope', '$scope', '$cookies',
    '$mdToast', '$window', '$mdDialog', 'unit', 'position',
    function ($timeout, $translate, $rootScope, $scope, $cookies,
              $mdToast, $window, $mdDialog, unit, position) {
        $scope.transceiver = {};
        $scope.transceiver = unit;

        $timeout(function () {
            let el = $('md-dialog');
            el.css('position', 'fixed');
            el.css('top', position['top']);
            el.css('right', position['right']);
            $window.document.getElementById('tosaInputId').focus();
        });

        $scope.submit = function () {
            Meteor.call('updateTransceiver', $scope.transceiver, (err) => {
                if (!err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Tranceiver ' + $scope.transceiver._id + ' successfully updated')
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

        $scope.onKeyPressed = function (e, ctrl) {
            if (e.which === 13) {
                $window.document.getElementById(ctrl).focus();
            }
        };

        $scope.closeClick = function () {
            $mdDialog.cancel();
        };
    }
]);
