import angular from 'angular';
import './layouts/states/triangular/triangular.controller';
import './layouts/states/triangular/triangular.tmpl.html';

angular.module('triangular').config(routeConfig);

routeConfig.$inject = ['$stateProvider'];

/* @ngInject */
function routeConfig($stateProvider) {
    $stateProvider
        .state('triangular', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'imports/ui/daasfab/triangular/layouts/states/triangular/triangular.tmpl.html',
                    controller: 'TriangularStateController',
                    controllerAs: 'stateController'
                },
                'sidebarLeft@triangular': {
                    templateProvider: function ($templateRequest, triLayout) {
                        if (angular.isDefined(triLayout.layout.sidebarLeftTemplateUrl)) {
                            return $templateRequest(triLayout.layout.sidebarLeftTemplateUrl);
                        }
                    },
                    controllerProvider: function (triLayout) {
                        return triLayout.layout.sidebarLeftController;
                    },
                    controllerAs: 'vm'
                },
                'sidebarRight@triangular': {
                    templateProvider: function ($templateRequest, triLayout) {
                        if (angular.isDefined(triLayout.layout.sidebarRightTemplateUrl)) {
                            return $templateRequest(triLayout.layout.sidebarRightTemplateUrl);
                        }
                    },
                    controllerProvider: function (triLayout) {
                        return triLayout.layout.sidebarRightController;
                    },
                    controllerAs: 'vm'
                },
                'toolbar@triangular': {
                    templateProvider: function ($templateRequest, triLayout) {
                        if (angular.isDefined(triLayout.layout.toolbarTemplateUrl)) {
                            return $templateRequest(triLayout.layout.toolbarTemplateUrl);
                        }
                    },
                    controllerProvider: function (triLayout) {
                        return triLayout.layout.toolbarController;
                    },
                    controllerAs: 'vm'
                },
                'loader@triangular': {
                    templateProvider: function ($templateRequest, triLayout) {
                        if (angular.isDefined(triLayout.layout.loaderTemplateUrl)) {
                            return $templateRequest(triLayout.layout.loaderTemplateUrl);
                        }
                    },
                    controllerProvider: function (triLayout) {
                        return triLayout.layout.loaderController;
                    },
                    controllerAs: 'loader'
                }
            }
        });
}

