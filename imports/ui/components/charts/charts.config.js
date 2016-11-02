'use strict';

import angular from 'angular';
import '../../daasfab/triangular/components/widget/widget-chart.directive';
import './trend-charts.controller';
import './trend-charts.tmpl.html';
import './yield-check.controller';
import './yield-check.tmpl.html';
import './test-speed.controller';
import './test-speed.tmpl.html';
import './spc-charts.controller';
import './spc-charts.tmpl.html';
import './powercal-beforetx.controller';
import './powercal-beforetx.tmpl.html';
import './packout-charts.controller';
import './packout-charts.tmpl.html';
import './test-insertions.controller';
import './test-insertions.tmpl.html';
import './loss-check.controller';
import './loss-check.tmpl.html';
import './mes-charts.controller';
import './mes-charts.tmpl.html';
import './shipout-charts.controller';
import './shipout-charts.tmpl.html';

/**
 * @ngdoc module
 * @name kaiam.spcs
 * @description
 *
 * The `kaiam.spcs` module handles statistical process control charts.
 */
angular.module('kaiamCharts')
    .config(['$translatePartialLoaderProvider', '$stateProvider', '$compileProvider',
        function ($translatePartialLoaderProvider, $stateProvider, $compileProvider) {
            $translatePartialLoaderProvider.addPart('charts');
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

            $stateProvider
                .state('triangular.timetrend', {
                    url: '/timetrend?:type:subtype',
                    templateUrl: 'imports/ui/components/charts/trend-charts.tmpl.html',
                    controller: 'TimetrendChartsController'
                })
                .state('triangular.spcs', {
                    url: '/spc?:type:subtype',
                    templateUrl: 'imports/ui/components/charts/spc-charts.tmpl.html',
                    controller: 'SpcChartsController'
                })
                .state('triangular.packout', {
                    url: '/packout',
                    templateUrl: 'imports/ui/components/charts/packout-charts.tmpl.html',
                    controller: 'PackoutChartsController'
                })
                .state('triangular.testinsertions', {
                    url: '/testinsertions',
                    templateUrl: 'imports/ui/components/charts/test-insertions.tmpl.html',
                    controller: 'TestInsertionsController'
                })
                .state('triangular.mescharts', {
                    url: '/mescharts',
                    templateUrl: 'imports/ui/components/charts/mes-charts.tmpl.html',
                    controller: 'MesChartsController'
                })
                .state('triangular.shipout', {
                    url: '/shipout',
                    templateUrl: 'imports/ui/components/charts/shipout-charts.tmpl.html',
                    controller: 'ShipoutChartsController'
                })
                .state('triangular.powercalbeforetx', {
                    url: '/powercalbeforetx',
                    templateUrl: 'imports/ui/components/charts/powercal-beforetx.tmpl.html',
                    controller: 'PowercalbeforetxController'
                })
                .state('triangular.testspeed', {
                    url: '/testspeed',
                    templateUrl: 'imports/ui/components/charts/test-speed.tmpl.html',
                    controller: 'TestSpeedController'
                })
                .state('triangular.yieldcheck', {
                    url: '/yieldcheck',
                    templateUrl: 'imports/ui/components/charts/yield-check.tmpl.html',
                    controller: 'YieldCheckController'
                })
                .state('triangular.losscheck', {
                    url: '/losscheck',
                    templateUrl: 'imports/ui/components/charts/loss-check.tmpl.html',
                    controller: 'LossCheckController',
                    params: {
                        'pnum': null,
                        'week': null,
                        'rework': null,
                        'device': null,
                        'yieldType': null
                    }
                });
        }
    ]);
