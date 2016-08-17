'use strict';

import angular from 'angular';
import './widget.directive';

/**
 * @ngdoc directive
 * @name widgetChart
 * @restrict A
 * @scope
 *
 * @description
 *
 * Widget as a placeholder for charts
 *
 * @usage
 * ```html
 * <widget widget-chart>
 * ```
 */
angular.module('triangular.components')
    .directive('widgetChart', [
        function () {
            return {
                require: '^triWidget',
                restrict: 'A',
                link: function ($scope, $element, attrs, widgetCtrl) {
                    $scope.widgetCtrl = widgetCtrl;
                    $scope.widgetCtrl.setLoading(true);
                }
            };
        }
    ]);
