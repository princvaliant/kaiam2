'use strict';

import angular from 'angular';
import '../../daasfab/triangular/components/widget/widget-chart.directive';
import './settings.module';
import './companies.controller';
import './companies.tmpl.html';
import './rework-codes.controller';
import './rework-codes.tmpl.html';
import './users.controller';
import './users.tmpl.html';
import './user.controller';
import './user.tmpl.html';
import './edit-button.html';
/**
 * @ngdoc module
 * @name kaiamSettings
 * @description Settings for the application
 */
angular.module('kaiamSettings')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('settings');
            $stateProvider.state('triangular.settings-users', {
                url: '/settings-users',
                templateUrl: 'imports/ui/components/settings/users.tmpl.html',
                controller: 'SettingsUsersController',
                controllerAs: 'vm'
            });
            $stateProvider.state('triangular.settings-companies', {
                url: '/settings-companies',
                templateUrl: 'imports/ui/components/settings/companies.tmpl.html',
                controller: 'SettingsCompaniesController',
                controllerAs: 'vm'
            });
            $stateProvider.state('triangular.settings-rework-codes', {
                url: '/settings-rework-codes',
                templateUrl: 'imports/ui/components/settings/rework-codes.tmpl.html',
                controller: 'SettingsReworkCodesController',
                controllerAs: 'vm'
            });
        }
    ]);

