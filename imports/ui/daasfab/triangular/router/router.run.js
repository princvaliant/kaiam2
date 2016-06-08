import angular from 'angular';

angular.module('triangular').run(runFunction);

runFunction.$inject = ['$rootScope', '$window', '$state', '$filter', '$timeout', '$injector', 'triRoute', 'triBreadcrumbsService'];

/* @ngInject */
function runFunction($rootScope, $window, $state, $filter, $timeout, $injector, triRoute, triBreadcrumbsService) {
    let breadcrumbs = triBreadcrumbsService.breadcrumbs;

    // change title when language changes - when a menu item is clicked - on app init
    let menuTitleHandler = $rootScope.$on('changeTitle', function () {
        setFullTitle();
    });

    $rootScope.$on('$destroy', function () {
        menuTitleHandler();
    });

    function setFullTitle() {
        $timeout(function () {
            let title = triRoute.title;
            angular.forEach(breadcrumbs.crumbs, function (crumb) {
                let name = crumb.name;
                if ($injector.has('translateFilter')) {
                    name = $filter('translate')(crumb.name);
                }
                title += ' ' + triRoute.separator + ' ' + name;
            });
            $window.document.title = title;
        });
    }
}

