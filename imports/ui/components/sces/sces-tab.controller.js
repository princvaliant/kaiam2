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
angular.module('kaiamSces').controller('ScesTabController', [
    '$rootScope', '$scope', '$cookies', '$state', '$translate', '$translatePartialLoader', 'ScesService', ($rootScope, $scope, $cookies, $state, $translate, $translatePartialLoader, ScesService) => {
        // Refresh translator
        $translatePartialLoader.addPart('sces');
        $translate.refresh();
        // Get list of tabs
        $scope.$watch('selectedTab', function (current) {
            $cookies.put('scesSelectedTab', current);
            $state.go('triangular.sces.tab.' + $scope.tabs[current]);
        });
        $scope.selectedTab = $cookies.get('scesSelectedTab') || '0';
        $scope.tabs = ScesService.domainFilters(Meteor.user());
    }
]);
