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
angular.module('kaiamSces').controller('ScesController', [
    '$rootScope', '$cookies', '$q', '$scope', '$state', '$translate', '$translatePartialLoader', 'ScesService',
    ($rootScope, $cookies, $q, $scope, $state, $translate, $translatePartialLoader, ScesService) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
    }
]);
