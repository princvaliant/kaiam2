import angular from 'angular';
import './404.tmpl.html';
import './401.tmpl.html';
import './500.tmpl.html';


angular.module('daasfab')
    .config(routeConfig);

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

/* @ngInject */
function routeConfig ($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true,
        rewriteLinks: true
    });

    // 404 & 500 pages
    $stateProvider
        .state('404', {
            url: '/404',
            views: {
                'root': {
                    templateUrl: 'imports/ui/daasfab/404.tmpl.html',
                    controller: 'ErrorPageController',
                    controllerAs: 'vm'
                }
            }
        })

        .state('401', {
            url: '/401',
            views: {
                'root': {
                    templateUrl: 'imports/ui/daasfab/401.tmpl.html',
                    controller: 'ErrorPageController',
                    controllerAs: 'vm'
                }
            }
        })

        .state('500', {
            url: '/500',
            views: {
                'root': {
                    templateUrl: 'imports/ui/daasfab/500.tmpl.html',
                    controller: 'ErrorPageController',
                    controllerAs: 'vm'
                }
            }
        });


    // set default routes when no path specified
    $urlRouterProvider.when('/', '/dashboard');

    // always goto 404 if route not found
    $urlRouterProvider.deferIntercept();
    $urlRouterProvider.otherwise('/404');

}

