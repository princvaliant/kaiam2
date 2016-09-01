'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.service';
/**
 * @ngdoc function
 * @name ScesTabController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesTabController', [
    '$rootScope', '$scope', '$cookies', '$state', '$translate', '$translatePartialLoader', 'ScesService', ($rootScope, $scope, $cookies, $state, $translate, $translatePartialLoader, ScesService) => {
        // Refresh translator
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        // Get list of tabs
    }
]);
