import angular from 'angular';
import '../../daasfab/triangular/components/widget/widget-chart.directive';
import './dashboard.controller';
import './dashboard.tmpl.html';

/**
 * @ngdoc module
 * @name kaiamDashboard
 * @description
 *
 * The `kaiamDashboard` module adds an dashboard page
 */

angular.module('kaiamDashboard').config(['$translatePartialLoaderProvider', '$stateProvider',
    function ($translatePartialLoaderProvider, $stateProvider) {
        $translatePartialLoaderProvider.addPart('dashboard');
        $stateProvider
            .state('triangular.dashboard', {
                url: '/dashboard',
                templateUrl: 'imports/ui/components/dashboard/dashboard.tmpl.html',
                controller: 'DashboardController as ctrl'
            });
    }
]);
