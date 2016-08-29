'use strict';

import angular from 'angular';
import './spec-actions.controller';
import './spec-actions.tmpl.html';

/**
 * @ngdoc module
 * @name kaiamSpecActions
 * @description
 *
 * The kaiamSpecActions module for managing specs and actions
 */
angular.module('kaiamSpecActions')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('spec-actions');
            $stateProvider.state('triangular.specactions', {
                url: '/specactions?:class',
                templateUrl: 'imports/ui/components/spec-actions/spec-actions.tmpl.html',
                controller: 'SpecActionsController'
            });
        }
    ]);
