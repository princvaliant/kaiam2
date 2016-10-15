import angular from 'angular';

angular.module('daasfab')
    .run(runFunction);

runFunction.$inject = ['$rootScope', '$state', '$urlRouter', '$timeout'];

/* @ngInject */
function runFunction ($rootScope, $state, $urlRouter, $timeout) {

    // default redirect if access is denied
    function redirectError (event, toState, toParams, fromState, fromParams, error) {
        if (error === 'AUTH_REQUIRED') {
            // It is better to use $state instead of $location. See Issue #283.
            $state.go('authentication.login');
        } else if (error) {
            $state.go('500');
        }
    }

    $timeout(() => {
        $urlRouter.sync();
        $urlRouter.listen();
        $timeout(() => {
            $urlRouter.sync();
            $urlRouter.listen();
            $timeout(() => {
                $urlRouter.sync();
                $urlRouter.listen();
            }, 600);
        }, 300);
    }, 200);

    // redirect all errors to permissions to 500
    $rootScope.$on('$stateChangeError', redirectError);
}

