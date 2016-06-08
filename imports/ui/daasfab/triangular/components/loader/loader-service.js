import angular from 'angular';

angular.module('triangular.components').factory('triLoaderService', LoaderService);

LoaderService.$inject = ['$rootScope'];

/* @ngInject */
function LoaderService($rootScope) {
    let active = false;

    return {
        isActive: isActive,
        setLoaderActive: setLoaderActive
    };

    ////////////////

    function isActive() {
        return active;
    }

    function setLoaderActive(setActive) {
        active = setActive;
        $rootScope.$broadcast('loader', active);
    }
}

