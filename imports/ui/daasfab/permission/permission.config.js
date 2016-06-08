import angular from 'angular';
import './pages/permission.controller';
import './pages/permission.tmpl.html';
import './pages/permission-define.tmpl.html';
import './pages/permission-routes.tmpl.html';
import './pages/permission-views.tmpl.html';


angular.module('app.permission').config(permissionConfig);

permissionConfig.$inject = ['$stateProvider', 'triMenuProvider', 'UserService'];

/* @ngInject */
function permissionConfig($stateProvider, triMenuProvider, UserService) {
    $stateProvider
        .state('triangular.permission', {
            url: '/permission',
            templateUrl: 'imports/ui/daasfab/permission/pages/permission.tmpl.html',
            controller: 'PermissionController',
            controllerAs: 'vm',
            resolve: {
                users: ['UserService', function (UserService) {
                    return UserService.getUsers();
                }]
            },
            data: {
                layout: {
                    contentClass: 'layout-column'
                }
            }
        })
        .state('triangular.permission-define', {
            url: '/permission/define',
            templateUrl: 'imports/ui/daasfab/permission/pages/permission-define.tmpl.html',
            data: {
                layout: {
                    contentClass: 'layout-column'
                }
            }
        })
        .state('triangular.permission-routes', {
            url: '/permission/routes',
            templateUrl: 'imports/ui/daasfab/permission/permission-routes.tmpl.html',
            data: {
                layout: {
                    contentClass: 'layout-column'
                }
            }
        })
        .state('triangular.permission-views', {
            url: '/permission/views',
            templateUrl: 'imports/ui/daasfab/permission/pages/permission-views.tmpl.html',
            data: {
                layout: {
                    contentClass: 'layout-column'
                }
            }
        });

    triMenuProvider.addMenu({
        name: 'Permissions',
        icon: 'zmdi zmdi-lock',
        type: 'dropdown',
        priority: 4.1,
        children: [{
            name: 'Permissions',
            state: 'triangular.permission',
            type: 'link'
        }, {
            name: 'Define Roles',
            state: 'triangular.permission-define',
            type: 'link'
        }, {
            name: 'Routes',
            state: 'triangular.permission-routes',
            type: 'link'
        }, {
            name: 'Views',
            state: 'triangular.permission-views',
            type: 'link'
        }]
    });
}

