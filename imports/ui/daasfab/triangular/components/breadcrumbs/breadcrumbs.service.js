import angular from 'angular';

angular.module('triangular.components').factory('triBreadcrumbsService', BreadcrumbsService);

BreadcrumbsService.$inject = ['$rootScope'];

/* @ngInject */
function BreadcrumbsService($rootScope) {
    let crumbs = [];

    return {
        breadcrumbs: {
            crumbs: crumbs
        },
        addCrumb: addCrumb,
        reset: reset
    };

    ////////////////

    function addCrumb(item) {
        this.breadcrumbs.crumbs.unshift(item);
        $rootScope.$emit('changeTitle');
    }

    function reset() {
        this.breadcrumbs.crumbs = [];
    }
}

