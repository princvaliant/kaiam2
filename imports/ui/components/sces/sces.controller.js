'use strict';

import angular from 'angular';

/**
 * @ngdoc function
 * @name ScesController
 * @module kaiamSces
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
