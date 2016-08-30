'use strict';
/**
 * @ngdoc service
 * @name SpcChartsService
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').service('LossCheckService', ['$translate', ($translate) => {
    CanvasJS.addColorSet('customColorSet', Settings.customColorSet);

    let visibility = {};

    let service = {

        construct: (doc, charts, rack, title, barClick) => {
            let _charts = charts;
            if (_charts === null) {
                _charts = {
                    animationDuration: 300,
                    animationEnabled: true,
                    title: {
                        text: title ? title + ' ' + rack : rack,
                        fontSize: 16,
                        fontColor: 'DarkSlateGrey'
                    },
                    axisX: {
                        tickThickness: 0,
                        lineThickness: 0,
                        labelFontSize: 18,
                        labelFontColor: 'Peru'
                    },
                    axisY2: {
                        gridThickness: 1,
                        titleFontSize: 14,
                        labelFontSize: 11,
                        lineThickness: 1,
                        interlacedColor: 'rgba(1,77,101,.05)',
                        gridColor: 'rgba(1,77,101,.1)'
                    },
                };
                _charts.data = [{
                    type: 'bar',
                    axisYType: 'secondary',
                    showInLegend: false,
                    indexLabelFontSize: 10,
                    indexLabelFontWeight: 100,
                    indexLabelFontColor: 'black',
                    indexLabelFontFamily: 'Verdana',
                    toolTipContent: 'Fails: {y}',
                    dataPoints: []
                }];
            }
            if (doc.fail > 0) {
                let t = doc._id.tsts;
                let y = doc._id.tsts;
                if (_.isArray(t)) {
                    t = t.toString();
                }
                y = 100 * doc.pass;
                if (isNaN(doc.pass) || doc.pass === Infinity) {
                    y = '100% ' + t;
                } else {
                    y = y.toFixed(2) + '% ' + t;
                }


                let dataPoint = _.find(_charts.data[0].dataPoints, function (item) {
                    return item.indexLabel === t;
                });
                if (dataPoint === undefined) {
                    _charts.data[0].dataPoints.push({
                        color: Settings.processStepColor[t.split('|')[0]],
                        y: doc.fail,
                        cursor: 'pointer',
                        label: ' ',
                        indexLabel: y,
                        t: t,
                        click: function (e) {
                            barClick(e.dataPoint.t, doc);
                        }
                    });
                } else {
                    dataPoint.y += doc.fail;
                }
            }
            return _charts;
        },
        constructLossTrend: function (doc, charts, rack, ltv, title, renderCallback) {
            let _charts = charts;
            if (_charts === null) {
                _charts = {
                    zoomEnabled: true,
                    zoomType: 'xy',
                    animationDuration: 100,
                    animationEnabled: true,
                    title: {
                        text: title || $translate.instant('MENU.CHARTS.LOSSTREND'),
                        fontSize: 16,
                        fontColor: 'DarkSlateGrey'
                    },
                    axisX: {
                        title: rack,
                        interval: 1,
                        intervalType: 'day',
                        labelAngle: -10,
                        labelFontSize: 11,
                        titleFontSize: 14,
                        lineThickness: 0
                    },
                    axisY: {
                        gridThickness: 1,
                        titleFontSize: 14,
                        labelFontSize: 11,
                        lineThickness: 1,
                        includeZero: true
                    },
                    legend: {
                        verticalAlign: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: 12,
                        fontColor: 'DarkSlateGrey',
                        fontFamily: 'Tahoma',
                        cursor: 'pointer',
                        itemclick: (e) => {
                            if (typeof(e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
                                e.dataSeries.visible = false;
                            } else {
                                e.dataSeries.visible = true;
                            }
                            visibility[e.dataSeries.legendText] = e.dataSeries.visible;
                            renderCallback();
                        },
                    },
                };
                _charts.data = [];
            }

            // Create series
            let series = _.find(_charts.data, (item) => {
                return item.legendText === doc._id.tsts;
            });
            if (series === undefined) {
                series = {
                    type: 'line',
                    xValueType: 'dateTime',
                    legendText: doc._id.tsts,
                    showInLegend: true,
                    color: Settings.processStepColor[doc._id.tsts],
                    toolTipContent: "<span style='\"'color: {color};'\"'><br/>{legendText}<br/>" +
                    'X value: {label}<br/>Fail: {y}</strong><hr/>',
                    dataPoints: []
                };
                _charts.data.push(series);
            }
            series.visible = visibility[doc._id.tsts] === undefined ? true : visibility[doc._id.tsts];
            let y = doc.fail;
            if (ltv === 'Fail %') {
                y = 100 * doc.pass;
            }
            series.dataPoints.push({
                x: moment(doc._id.d, 'YYYY-MM-DD').toDate(),
                label: doc._id.d,
                y: y
            });
            return _charts;
        }
    };
    return service;
}]);
