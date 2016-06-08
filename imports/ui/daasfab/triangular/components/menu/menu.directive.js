import angular from 'angular';
import './menu-item.directive';
import '../../themes/theming.provider';

angular
    .module('triangular.components')
    .directive('triMenu', triMenuDirective);

triMenuDirective.$inject = ['$mdTheming', 'triTheming'];
triMenuController.$inject = ['triMenu'];

/* @ngInject */
function triMenuDirective( $mdTheming, triTheming) {
    let directive = {
        restrict: 'E',
        template: '<md-content><tri-menu-item permission permission-only="item.permission" ng-repeat="item in triMenuController.menu | orderBy:\'priority\'" item="::item"></tri-menu-item></md-content>',
        scope: {},
        controller: triMenuController,
        controllerAs: 'triMenuController',
        link: link
    };
    return directive;

    function link($scope, $element) {
        $mdTheming($element);
        let $mdTheme = $element.controller('mdTheme'); //eslint-disable-line

        let menuColor = triTheming.getThemeHue($mdTheme.$mdTheme, 'primary', 'default');
        let menuColorRGBA = triTheming.rgba(menuColor.value);
        $element.css({'background-color': menuColorRGBA});
        $element.children('md-content').css({'background-color': menuColorRGBA});
    }
}

/* @ngInject */
function triMenuController(triMenu) {
    let triMenuController = this;
    // get the menu and order it
    triMenuController.menu = triMenu.menu;
}
