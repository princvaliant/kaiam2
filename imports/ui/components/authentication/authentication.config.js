import angular from 'angular';
import './layouts/authentication.tmpl.html';
import './forgot/forgot.controller';
import './forgot/forgot.tmpl.html';
import './lock/lock.controller';
import './lock/lock.tmpl.html';
import './login/login.tmpl.html';
import './login/login.controller';
import './profile/profile.controller';
import './profile/profile.tmpl.html';
import './resetpassword/resetpassword.controller';
import './resetpassword/resetpassword.tmpl.html';
import './signup/password.messages.html';
import './signup/same-password.directive';
import './signup/signup.controller';
import './signup/signup.tmpl.html';

angular.module('kaiamAuthentication').config(routeConfig);
routeConfig.$inject = ['$translatePartialLoaderProvider', '$stateProvider'];
function routeConfig($translatePartialLoaderProvider, $stateProvider) {
    $translatePartialLoaderProvider.addPart('authentication');
    $stateProvider
        .state('authentication', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'imports/ui/components/authentication/layouts/authentication.tmpl.html'
                }
            }
        })
        .state('authentication.login', {
            url: '/login',
            templateUrl: 'imports/ui/components/authentication/login/login.tmpl.html',
            controller: 'LoginController'
        })
        .state('authentication.signup', {
            url: '/signup',
            templateUrl: 'imports/ui/components/authentication/signup/signup.tmpl.html',
            controller: 'SignupController'
        })
        .state('authentication.lock', {
            url: '/lock',
            templateUrl: 'imports/ui/components/authentication/lock/lock.tmpl.html',
            controller: 'LockController'
        })
        .state('authentication.forgot', {
            url: '/forgot',
            templateUrl: 'imports/ui/components/authentication/forgot/forgot.tmpl.html',
            controller: 'ForgotController'
        })
        .state('authentication.resetpassword', {
            url: '/resetpassword/:token',
            templateUrl: 'imports/ui/components/authentication/resetpassword/resetpassword.tmpl.html',
            controller: 'ResetPasswordController'
        });
}


