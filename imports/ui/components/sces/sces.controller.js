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
angular.module('kaiamSces').
controller('ScesController', [
  '$rootScope', '$cookies', '$q', '$scope', '$state', '$translate', '$translatePartialLoader', 'ScesService', ($rootScope, $cookies, $q, $scope, $state, $translate, $translatePartialLoader, ScesService) => {
    $translatePartialLoader.addPart('sces');
    $translate.refresh();

    $scope.browseClicked = function() {
      let tabs = ScesService.domainFilters($rootScope.currentUser);
      let selectedTab = $cookies.get('scesSelectedTab') || 0;
      $state.go('triangular.sces.tab.' + tabs[selectedTab]);
    };
  }
]);
