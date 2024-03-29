import angular from 'angular';
import './widget.tmpl.html';

angular.module('triangular.components').directive('triWidget', widget);

widget.$inject = ['$mdTheming'];
Controller.$inject = ['$scope'];

/* @ngInject */
function widget ($mdTheming) {
    // Usage:
    //
    // ```html
    // <widget title="'Nice Title'" subtitle="'Subtitle'" avatar="http://myavatar.jpg" title-position="top|bottom|left|right" content-padding overlay-title>content here</widget>
    // ```

    // Creates:
    //
    // Widget for use in dashboards
    let directive = {
        restrict: 'E',
        templateUrl: 'imports/ui/daasfab/triangular/components/widget/widget.tmpl.html',
        transclude: true,
        replace: true,
        scope: {
            title: '@',
            subtitle: '@',
            avatar: '@'
        },
        bindToController: true,
        controller: Controller,
        controllerAs: 'vm',
        link: link
    };
    return directive;

    function link($scope, $element, attrs) {
        // set the value of the widget layout attribute
        $scope.vm.widgetLayout = attrs.titlePosition === 'left' || attrs.titlePosition === 'right' ? 'row' : 'column';
        // set the layout attribute for the widget content
        $scope.vm.contentLayout = angular.isUndefined(attrs.contentLayout) ? 'column' : attrs.contentLayout;
        // set if the layout-padding attribute will be added
        $scope.vm.contentPadding = angular.isDefined(attrs.contentPadding);
        // set the content align
        $scope.vm.contentLayoutAlign = angular.isUndefined(attrs.contentLayoutAlign) ? '' : attrs.contentLayoutAlign;
        // set the order of the title and content based on title position
        $scope.vm.titleOrder = attrs.titlePosition === 'right' || attrs.titlePosition === 'bottom' ? 2 : 1;
        $scope.vm.contentOrder = attrs.titlePosition === 'right' || attrs.titlePosition === 'bottom' ? 1 : 2;
        // set if we overlay the title on top of the widget content
        $scope.vm.overlayTitle = angular.isUndefined(attrs.overlayTitle) ? undefined : true;

        $mdTheming($element);

        if (angular.isDefined(attrs.class)) {
            $element.addClass(attrs.class);
        }

        if (angular.isDefined(attrs.backgroundImage)) {
            $element.css('background-image', 'url(' + attrs.backgroundImage + ')');
        }

        $scope.menuClick = function ($event) {
            if (angular.isUndefined($scope.menu.menuClick)) {
                $scope.menu.menuClick($event);
            }
        };

        // remove title attribute to stop popup on hover
        $element.attr('title', '');
    }
}

/* @ngInject */
function Controller($scope) {
    let vm = this;
    vm.menu = null;
    vm.loading = false;

    this.setMenu = function (menu) {
        vm.menu = menu;
    };

    this.setLoading = function (loading) {
        setTimeout(function () {
            $scope.$apply(function () {
                vm.loading = loading;
            });
        }, 0);
    };
}
