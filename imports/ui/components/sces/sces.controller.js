'use strict';

import angular from 'angular';

/**
 * @ngdoc function
 * @name IntroductionController
 * @module triAngularDashboards
 * @kind function
 *
 *
 */
angular.module('kaiamSces').controller('ScesController', [
    '$rootScope', '$cookies', '$q', '$scope', '$stateParams', '$translate', '$translatePartialLoader',
    ($rootScope, $cookies, $q, $scope, $stateParams, $translate, $translatePartialLoader) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();


        console.log($scope.domain);
    }
]);
