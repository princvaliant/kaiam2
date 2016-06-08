
import angular from 'angular';

angular.module('daasfab')
    .run( runFunction);

runFunction.$inject =  ['$rootScope', '$state'];

/* @ngInject */
function runFunction($rootScope, $state) {

    // default redirect if access is denied
    function redirectError() {
        $state.go('500');
    }

    // watches

    // redirect all errors to permissions to 500
    var errorHandle = $rootScope.$on('$stateChangeError', redirectError);

    // remove watch on destroy
    $rootScope.$on('$destroy', function () {
        errorHandle();
    });
}

