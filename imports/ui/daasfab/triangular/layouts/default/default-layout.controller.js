import angular from 'angular';

angular.module('triangular.layouts').controller('DefaultLayoutController', DefaultLayoutController);

DefaultLayoutController.$inject = ['$scope', '$element', '$timeout', '$window', 'triLayout'];

/* @ngInject */
function DefaultLayoutController($scope, $element, $timeout, $window, triLayout) {
    // we need to use the scope here because otherwise the expression in md-is-locked-open doesnt work
    $scope.layout = triLayout.layout; //eslint-disable-line
    let vm = this;

    vm.activateHover = activateHover;
    vm.removeHover = removeHover;

    ////////////////

    function activateHover() {
        if (triLayout.layout.sideMenuSize === 'icon') {
            $element.find('.admin-sidebar-left').addClass('hover');
            $timeout(function () {
                $window.dispatchEvent(new Event('resize'));
            }, 300);
        }
    }

    function removeHover() {
        if (triLayout.layout.sideMenuSize === 'icon') {
            $element.find('.admin-sidebar-left').removeClass('hover');
            $timeout(function () {
                $window.dispatchEvent(new Event('resize'));
            }, 300);
        }
    }
}
