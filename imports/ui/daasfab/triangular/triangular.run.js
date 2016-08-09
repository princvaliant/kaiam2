import angular from 'angular';

angular.module('triangular').run(runFunction);

runFunction.$inject = ['$rootScope', '$window', '$state'];

/* @ngInject */
function runFunction($rootScope, $window, $state) {
    // add a class to the body if we are on windows
    if ($window.navigator.platform.indexOf('Win') !== -1) {
        $rootScope.bodyClasses = ['os-windows'];
    }
}

