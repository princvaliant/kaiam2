'use strict';
/**
 * @ngdoc service
 * @name ChartsService
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts')
    .service('TimetrendChartsService', ['$translate',
        function ($translate) {
            let service = {
                construct: function (doc, field, charts, renderCallback) {
                    let channel = doc.c;
                    let temp = doc.t;
                    if (charts[channel] === undefined) {
                        charts[channel] = {
                            zoomEnabled: true,
                            zoomType: 'xy',
                            animationEnabled: false,
                            title: {
                                text: 'Channel ' + channel,
                                fontSize: 16,
                                fontColor: 'DarkSlateGrey'
                            },
                            axisX: {
                                title: '', //$translate.instant('timestamp'),
                                labelAngle: -10,
                                labelFontSize: 11,
                                titleFontSize: 14
                            },
                            axisY: {
                                title: $translate.instant(field),
                                gridThickness: 1,
                                titleFontSize: 14
                            },
                            legend: {
                                verticalAlign: 'bottom',
                                horizontalAlign: 'center',
                                fontSize: 12,
                                fontColor: 'DarkSlateGrey',
                                fontFamily: 'Tahoma',
                                cursor: 'pointer',
                                itemclick: function (e) {
                                    if (typeof(e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
                                        e.dataSeries.visible = false;
                                    } else {
                                        e.dataSeries.visible = true;
                                    }
                                    renderCallback();
                                }
                            }
                        };
                    }

                    let c = charts[channel];
                    if (c.data === undefined) {
                        c.data = [];
                    }

                    // Add column definition for temperatures
                    let series = _.find(c.data, function (item) {
                        return item.name === 'Temperature ' + temp + ' C';
                    });

                    if (series === undefined) {
                        series = {
                            'type': 'scatter',
                            'name': 'Temperature ' + temp + ' C',
                            showInLegend: true,
                            markerSize: 3,
                            xValueType: 'dateTime',
                            toolTipContent: "<span style='\"'color: {color};'\"'><strong>{sn}</strong></span><br/>{cm}</span><br/>{name}</span><br/>Time: {time} <br/>Value: </strong></span> {y}",
                            dataPoints: []
                        };
                        c.data.push(series);
                    }

                    series.dataPoints.push({
                        x: moment(doc.d).valueOf(),
                        label: moment(doc.d).format('YYYY-MM-DD hh:mm:ss'),
                        y: doc.n,
                        sn: doc.s,
                        cm: '',
                        time: moment(doc.d).format('YYYY-MM-DD hh:mm:ss')
                    });
                    return charts;
                }
            };
            return service;
        }
    ]);
