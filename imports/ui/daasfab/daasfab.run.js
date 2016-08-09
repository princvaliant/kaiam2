import angular from 'angular';

angular.module('daasfab')
    .run(runFunction);

runFunction.$inject = ['$rootScope', '$state'];

/* @ngInject */
function runFunction($rootScope, $state) {

    // default redirect if access is denied
    function redirectError(event, toState, toParams, fromState, fromParams, error) {
        if (error === 'AUTH_REQUIRED') {
            // It is better to use $state instead of $location. See Issue #283.
            $state.go('authentication.login');
        } else {
            $state.go('500');
        }
    }

    // redirect all errors to permissions to 500
    $rootScope.$on('$stateChangeError', redirectError);
}

