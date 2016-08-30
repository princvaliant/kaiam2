'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';
/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesScanController', [
    '$state', '$scope', '$window', '$timeout', '$translate', '$translatePartialLoader',
    ($state, $scope, $window, $timeout, $translate, $translatePartialLoader) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        let keys = '';

        function focus () {
            $timeout(function () {
                let element = $window.document.getElementById('allScanOptions');
                if (element) {
                    element.focus();
                }
            }, 1200);
        }

        function jumpTo (code) {
            let c = code || $scope.code;
            Meteor.call('getDomain', c, (err, domain) => {
                if (err) {
                    $scope.message = err;
                } else {
                    if (domain) {
                        $state.transitionTo('triangular.sces.' + domain.type.toLowerCase(), {
                            id: domain._id
                        });
                    } else {
                        $scope.message = c + ' not found in database';
                    }
                }
            });
        }

        focus();
        // Key press calback used by barcode scanner
        $scope.onKeyPressed = function (e) {
            if (e.which === 13) {
                jumpTo(keys);
                keys = '';
            } else {
                keys += String.fromCharCode(e.which);
            }
        };
    }
]);
