import angular from 'angular';
import './layouts/states/triangular/triangular.controller';
import './layouts/states/triangular/triangular.tmpl.html';

angular.module('triangular').config(routeConfig);

routeConfig.$inject = ['$stateProvider'];

/* @ngInject */
function routeConfig ($stateProvider) {
    $stateProvider.state('triangular', {
        abstract: true,
        views: {
            'root': {
                templateUrl: 'imports/ui/daasfab/triangular/layouts/states/triangular/triangular.tmpl.html',
                controller: 'TriangularStateController',
                controllerAs: 'stateController',
                resolve: {
                    'currentUser': ['$q', function ($q) {
                        let defer = $q.defer();
                        Meteor.setTimeout(function () {
                            let user = Meteor.user();
                            if (user) {
                                defer.resolve();
                            } else {
                                defer.reject();
                            }
                        }, 500);
                        return defer.promise;
                    }],
                    'auth': ['$q',
                        function ($q) {
                            if (Meteor.userId()) {
                                return true;
                            } else {
                                return $q.reject('AUTH_REQUIRED');
                            }
                        }
                    ]
                }
            },
            'sidebarLeft@triangular': {
                templateProvider: ($templateRequest, triLayout) => {
                    if (angular.isDefined(triLayout.layout.sidebarLeftTemplateUrl)) {
                        return $templateRequest(triLayout.layout.sidebarLeftTemplateUrl);
                    }
                },
                controllerProvider: (triLayout) => {
                    return triLayout.layout.sidebarLeftController;
                },
                controllerAs: 'vm'
            },
            'sidebarRight@triangular': {
                templateProvider: ($templateRequest, triLayout) => {
                    if (angular.isDefined(triLayout.layout.sidebarRightTemplateUrl)) {
                        return $templateRequest(triLayout.layout.sidebarRightTemplateUrl);
                    }
                },
                controllerProvider: (triLayout) => {
                    return triLayout.layout.sidebarRightController;
                },
                controllerAs: 'vm'
            },
            'toolbar@triangular': {
                templateProvider: ($templateRequest, triLayout) => {
                    if (angular.isDefined(triLayout.layout.toolbarTemplateUrl)) {
                        return $templateRequest(triLayout.layout.toolbarTemplateUrl);
                    }
                },
                controllerProvider: (triLayout) => {
                    return triLayout.layout.toolbarController;
                },
                controllerAs: 'vm'
            },
            'loader@triangular': {
                templateProvider: ($templateRequest, triLayout) => {
                    if (angular.isDefined(triLayout.layout.loaderTemplateUrl)) {
                        return $templateRequest(triLayout.layout.loaderTemplateUrl);
                    }
                },
                controllerProvider: (triLayout) => {
                    return triLayout.layout.loaderController;
                },
                controllerAs: 'loader'
            }
        }
    });
}

