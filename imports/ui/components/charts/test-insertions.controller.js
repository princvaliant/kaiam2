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

angular.module('kaiamCharts').controller('TestInsertionsController', [
    '$scope', '$mdToast', '$cookies', '$translate', '$timeout', '$stateParams', ($scope, $mdToast, $cookies, $translate, $timeout, $stateParams) => {
        let chartsObjs;
        $scope.device = $cookies.get('testinsertionsDevice') || '100GB';
        $scope.changeDevice = (device) => {
            $scope.device = device;
            $cookies.put('testinsertionsDevice', device);
            get();
        };
        let chart = {
            title: {
                text: "Test Insertions",
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
                title: "Number of insertions"
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

        function get() {
            chart.data = [];
            $timeout(function () {
                $scope.widgetCtrl.setLoading(true);
            }, 10);
            Meteor.call('testInsertions', $scope.device, (err, testsinsertions) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    let racks = _.uniq(_.pluck(testsinsertions, 'rack'));
                    let dates = _.uniq(_.pluck(testsinsertions, 'date'));
                    _.each(racks, (rack) => {
                        let dataPoints = [];
                        _.each(dates, (date) => {
                            let found = _.find(testsinsertions, (num) => {
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
                    chartsObjs = new CanvasJS.Chart('testInsertionsChart', chart);
                    chartsObjs.render();
                    $timeout(function () {
                        $scope.widgetCtrl.setLoading(false);
                    }, 10);
                }
            });
        }
    }
]);
