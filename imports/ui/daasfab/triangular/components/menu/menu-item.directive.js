import angular from 'angular';
import './menu-item-divider.tmpl.html';
import './menu-item-dropdown.tmpl.html';
import './menu-item-link.tmpl.html';

angular.module('triangular.components').directive('triMenuItem', triMenuItemDirective);

triMenuItemDirective.$inject = [];
triMenuItemController.$inject = ['$scope', '$mdSidenav', '$state', '$filter', 'triBreadcrumbsService'];

/* @ngInject */
function triMenuItemDirective() {
    let directive = {
        restrict: 'E',
        require: '^triMenu',
        scope: {
            item: '='
        },
        // replace: true,
        template: '<div ng-include="::triMenuItem.item.template"></div>',
        controller: triMenuItemController,
        controllerAs: 'triMenuItem',
        bindToController: true
    };
    return directive;
}

/* @ngInject */
function triMenuItemController($scope, $mdSidenav, $state, $filter, triBreadcrumbsService) {
    let triMenuItem = this;
    // load a template for this directive based on the type ( link | dropdown )
    triMenuItem.item.template = 'imports/ui/daasfab/triangular/components/menu/menu-item-' + triMenuItem.item.type + '.tmpl.html';

    switch (triMenuItem.item.type) {
        case 'dropdown':
            // if we have kids reorder them by priority
            triMenuItem.item.children = $filter('orderBy')(triMenuItem.item.children, 'priority');
            triMenuItem.toggleDropdownMenu = toggleDropdownMenu;
            // add a check for open event
            $scope.$on('toggleDropdownMenu', function (event, item, open) {
                // if this is the item we are looking for
                if (triMenuItem.item === item) {
                    triMenuItem.item.open = open;
                } else {
                    triMenuItem.item.open = false;
                }
            });
            // this event is emitted up the tree to open parent menus
            $scope.$on('openParents', function () {
                // openParents event so open the parent item
                triMenuItem.item.open = true;
                // also add this to the breadcrumbs
                triBreadcrumbsService.addCrumb(triMenuItem.item);
            });
            break;
        case 'link':
            triMenuItem.openLink = openLink;

            // on init check if this is current menu
            checkItemActive($state.current.name, $state.params);

            $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                checkItemActive(toState.name, toParams);
            });
            break;
    }

    function checkItemActive() {
        // first check if the state is the same
        triMenuItem.item.active = $state.includes(triMenuItem.item.state, triMenuItem.item.params);
        // if we are now the active item reset the breadcrumbs and open all parent dropdown items
        if (triMenuItem.item.active) {
            triBreadcrumbsService.reset();
            triBreadcrumbsService.addCrumb(triMenuItem.item);
            $scope.$emit('openParents');
        }
    }

    function toggleDropdownMenu() {
        $scope.$parent.$parent.$broadcast('toggleDropdownMenu', triMenuItem.item, !triMenuItem.item.open);
    }

    function openLink() {
        let params = angular.isUndefined(triMenuItem.item.params) ? {} : triMenuItem.item.params;
        $state.go(triMenuItem.item.state, params);
        triMenuItem.item.active = true;
        $mdSidenav('left').close();
    }
}

