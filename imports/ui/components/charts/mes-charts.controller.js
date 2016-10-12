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
    '$scope', '$mdToast', '$cookies', '$translate', '$timeout', '$document', 'ExportDataService',
    ($scope, $mdToast, $cookies, $translate, $timeout, $document, ExportDataService) => {
        let chartsObjs;
        $scope.mesChartTypes = ['WIP', 'Non-moving inventory', 'Thruput'];
        $scope.chartType = $cookies.get('mesChartType') || 'WIP';
        $scope.interval = $cookies.get('mesChartInterval') || 'Daily';

        $scope.changeInterval = (interval) => {
            $scope.interval = interval;
            $cookies.put('mesChartInterval', interval);
            get();
        };

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

        let activityRanges = [
            {label: '> 12 month', x1: 31104000},
            {label: '> 6 month', x1: 15552000},
            {label: '> 3 month', x1: 7776000},
            {label: '> 1 month', x1: 2592000},
            {label: '> 2 weeks', x1: 1209600},
            {label: '> 1 week', x1: 604800},
            {label: '> 4 days', x1: 345600},
            {label: '> 3 days', x1: 259200},
            {label: '> 48 hours', x1: 172800},
            {label: '> 24 hours', x1: 86400},
            {label: '> 12 hours', x1: 43200}
        ];

        get();

        function get () {
            chart.data = [];
            $timeout(function () {
                $scope.widgetCtrl.setLoading(true);
            }, 10);
            switch ($scope.chartType) {
                case 'WIP':
                    constructWip();
                    break;
                case 'Non-moving inventory':
                    constructNonmovingInventory();
                    break;
                case 'Thruput':
                    constructMesThruput();
                    break;
                default:
                    constructWip();
                    break;
            }
        }


        function barClick (point, fileName) {
            Meteor.call('mesExportData', point.serials,
                (err, data) => {
                    if (err) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content($translate.instant('MES export error') + ' ' + err)
                                .position('top right')
                                .hideDelay(5000));
                    } else {
                        let ret = ExportDataService.exportData(data);
                        let blob = new Blob([ret.substring(1)], {type: 'data:text/csv;charset=utf-8'});
                        $scope.filename = fileName + ' ' + point.label + '.csv';
                        if (window.navigator.msSaveOrOpenBlob) {
                            navigator.msSaveBlob(blob, $scope.filename);
                        } else {
                            let downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
                            let downloadLink = angular.element(downloadContainer.children()[0]);
                            downloadLink.attr('href', (window.URL || window.webkitURL).createObjectURL(blob));
                            downloadLink.attr('download', $scope.filename);
                            downloadLink.attr('target', '_blank');
                            $document.find('body').append(downloadContainer);
                            $timeout(function () {
                                downloadLink[0].click();
                                downloadLink.remove();
                            }, null);
                        }
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
                    chart.title.text = 'Distribution per location (WIP)';
                    let records = _.map(data, (r) => {
                        r.click = (e) => {
                            barClick(e.dataPoint, 'mes wip');
                        };
                        return r;
                    });
                    chart.data.push({
                        type: 'column',
                        toolTipContent: '<span><strong>{label}</strong></span>: {y}',
                        dataPoints: records
                    });
                    chartsObjs = new CanvasJS.Chart('mesChartId', chart);
                    chartsObjs.render();
                    $timeout(function () {
                        $scope.widgetCtrl.setLoading(false);
                    }, 10);
                }
            });
        }

        function constructNonmovingInventory () {
            Meteor.call('mesChartsNonmovingInventory', (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    chart.title.text = 'Non-moving inventory report';
                    _.each(data, (series) => {
                        let records = _.map(angular.copy(activityRanges), (r) => {
                            r.click = (e) => {
                                barClick(e.dataPoint, 'mes non-moving inventory');
                            };
                            r.serials = [];
                            r.y = 0;
                            return r;
                        });
                        _.each(series.list, (item) => {
                            let record = _.find(records, (r) => {
                                return r.x1 <= item.duration;
                            });
                            if (record) {
                                record.y += 1;
                                record.serials.push(item.serial);
                            }
                        });
                        chart.data.push({
                            type: 'stackedColumn',
                            name: series._id,
                            showInLegend: 'true',
                            toolTipContent: '<span><strong>{name}</strong></span><br/><span><strong>{label}</strong></span>: {y}',
                            dataPoints: records
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

        function createThruputSeries (key, list, xvals, xprop) {
            let data = _.map(xvals, (d) => {
                let serials = [];
                let count = _.countBy(list, function (item) {
                    if (item[xprop] === d) {
                        serials.push(item.serial);
                        return true;
                    }
                    return false;
                });
                return {
                    label: d,
                    y: count.true,
                    serials: serials,
                    click: (e) => {
                        barClick(e.dataPoint, 'mes thruput');
                    }
                };
            });
            chart.data.push({
                type: 'stackedColumn',
                name: key,
                showInLegend: 'true',
                toolTipContent: '<span><strong>{name}</strong></span><br/><span><strong>{label}</strong></span>: {y}',
                dataPoints: data
            });
        }

        function constructMesThruput () {
            Meteor.call('mesChartsThruput', (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err)
                            .position('bottom right')
                            .hideDelay(3000));
                } else {
                    chart.title.text = 'Thruput';
                    // Group by location
                    let xprop = ($scope.interval === 'Daily') ? 'day' : 'week';
                    let xvals = _.uniq(_.pluck(data, xprop));
                    let group = _.groupBy(data, (item) => {
                        return item.location;
                    });
                    for (let key in group) {
                        if (group.hasOwnProperty(key)) {
                            createThruputSeries(key, group[key], xvals, xprop);
                        }
                    }
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
