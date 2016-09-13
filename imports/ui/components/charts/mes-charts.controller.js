'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').controller('MesChartsController', [
    '$scope', '$mdToast', '$cookies', '$translate', '$timeout',
    ($scope, $mdToast, $cookies, $translate, $timeout) => {
        let chartsObjs;
        $scope.mesChartTypes = ['Current', 'WIP'];
        $scope.chartType = $cookies.get('mesChartType') || 'Current';
        $scope.changeChartType = (ct) => {
            $scope.chartType = ct;
            $cookies.put('mesChartType', ct);
            get();
        };

        let chart = {
            title: {
                text: '',
                fontSize: 16,
                fontColor: 'DarkSlateGrey'
            },
            axisX: {
                labelFontSize: 11,
                titleFontSize: 14,
            },
            axisY: {
                labelFontSize: 11,
                titleFontSize: 14,
                title: ''
            },
            animationEnabled: true,
            data: [],
            legend: {
                cursor: "pointer",
                fontSize: 11,
                fontColor: 'DarkSlateGrey',
                fontFamily: 'Tahoma',
                itemclick: function (e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    }
                    else {
                        e.dataSeries.visible = true;
                    }
                    chartsObjs.render();
                }
            }
        };

        get();

        function get () {
            chart.data = [];
            switch ($scope.chartType) {
                case 'Current':
                    constructCurrent();
                    break;
                case 'WIP':
                    constructWip();
                    break;
                default:
                    constructCurrent();
                    break;
            }
        }

        function constructCurrent () {
            Meteor.call('mesChartsCurrent', (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    chart.title.text = 'Current distribution';
                    chart.data.push({
                        type: 'column',
                        toolTipContent: '<span><strong>{label}</strong></span>: {y}',
                        dataPoints: data
                    });
                    chartsObjs = new CanvasJS.Chart('mesChartId', chart);
                    chartsObjs.render();
                    $timeout(function () {
                        $scope.widgetCtrl.setLoading(false);
                    }, 10);
                }
            });
        }

        function constructWip () {
            Meteor.call('mesChartsWip', (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    let racks = _.uniq(_.pluck(data, 'rack'));
                    let dates = _.uniq(_.pluck(data, 'date'));
                    _.each(racks, (rack) => {
                        let dataPoints = [];
                        _.each(dates, (date) => {
                            let found = _.find(data, (num) => {
                                    return num.rack === rack && num.date === date;
                                }) || {total: 0};
                            dataPoints.push({y: found.total, label: date});
                        });
                        chart.data.push({
                            type: 'stackedColumn',
                            toolTipContent: "{label}<br/><span style='\"'color: {color};'\"'><strong>{name}</strong></span>: {y}",
                            name: rack,
                            showInLegend: 'true',
                            dataPoints: _.sortBy(dataPoints, 'label')
                        });
                    });
                    chartsObjs = new CanvasJS.Chart('mesChartId', chart);
                    chartsObjs.render();
                    $timeout(function () {
                        $scope.widgetCtrl.setLoading(false);
                    }, 10);
                }
            });
        }
    }
]);
