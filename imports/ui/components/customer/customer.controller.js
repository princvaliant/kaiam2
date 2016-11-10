'use strict';

import angular from 'angular';

/**
 * @ngdoc function
 * @name CustomerController
 * @module kaiamCustomer
 * @kind function
 *
 *
 */
angular.module('kaiamCustomer').controller('CustomerController', [
    '$rootScope', '$cookies', '$q', '$scope', '$stateParams', '$translate', '$translatePartialLoader',
    ($rootScope, $cookies, $q, $scope, $stateParams, $translate, $translatePartialLoader) => {
        $translatePartialLoader.addPart('customer');
        $translate.refresh();
    }
]);
