import angular from 'angular';

angular.module('triangular').run(runFunction);

runFunction.$inject = ['$rootScope', '$window'];

/* @ngInject */
function runFunction($rootScope, $window) {
    // add a class to the body if we are on windows
    if ($window.navigator.platform.indexOf('Win') !== -1) {
        $rootScope.bodyClasses = ['os-windows'];
    }
}

