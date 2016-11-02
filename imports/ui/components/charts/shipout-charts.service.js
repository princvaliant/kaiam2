'use strict';
/**
 * @ngdoc service
 * @name PackoutChartsService
 * @module kaiamCharts
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts')
    .service('ShipoutChartsService', [
        function () {
            CanvasJS.addColorSet('customColorSet', Settings.customColorset);
            let xval = 0;
            let label2 = '';
            let service = {
                construct: function (doc, charts, company, interval, renderCallback, barClick) {
                    let _charts = charts;
                    if (_charts === null) {
                        xval = 0;
                        _charts = {
                            animationEnabled: true,
                            animationDuration: 600,
                            colorSet: 'customColorSet',
                            title: {
                                text: interval + ' shipouts',
                                fontSize: 16,
                                fontColor: 'DarkSlateGrey'
                            },
                            axisX: {
                                valueFormatString: '-',
                                interval: 1,
                                labelAngle: -15,
                                labelFontSize: 10
                            },
                            axisY: {
                                labelFontSize: 11
                            },
                            legend: {
                                verticalAlign: 'top',
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
                        _charts.data = [];
                        _charts.companies = ['-all-'];
                    }

                    // Create series
                    let series = _.find(_charts.data, function (item) {
                        return item.legendText === doc.pnum;
                    });
                    if (series === undefined) {
                        series = {
                            type: 'stackedColumn',
                            legendText: doc.pnum,
                            color: (Settings.partNumbers[doc.pnum] && Settings.partNumbers[doc.pnum].color) ? Settings.partNumbers[doc.pnum].color : 'red',
                            showInLegend: true,
                            toolTipContent: "<span style='\"'color: {color};'\"'><strong>{pn}</strong><br/><br/>Date: {label}<br/>Value: {y}</strong></span>",
                            dataPoints: []
                        };
                        _charts.data.push(series);
                    }
                    if (interval === 'Daily') {
                        let dPoint = _.find(series.dataPoints, function (item) {
                            return item.label.localeCompare(doc.ts) === 0 && item.pn.localeCompare(doc.pnum) === 0;
                        });
                        if (dPoint === undefined) {
                            if (doc.ts !== label2) {
                                xval += 1;
                            }
                            label2 = doc.ts;
                            series.ids = [doc];
                            series.dataPoints.push({
                                x: xval,
                                label: doc.ts,
                                y: 1,
                                pn: doc.pnum,
                                click: function (e) {
                                    barClick(series.ids, doc.pnum + '-' + doc.ts);
                                }
                            });
                        } else {
                            dPoint.y += 1;
                            series.ids.push(doc);
                        }
                    }
                    if (interval === 'Weekly') {
                        let wk = doc.nd < '2016000' ? parseInt(doc.wk) + 1 : parseInt(doc.wk);
                        let label = 'Week ' + wk;
                        let dPoint = _.find(series.dataPoints, function (item) {
                            return item.label.localeCompare(label) === 0 && item.pn.localeCompare(doc.pnum) === 0;
                        });
                        if (dPoint === undefined) {
                            if (label !== label2) {
                                xval += 1;
                            }
                            series.ids = [doc];
                            label2 = label;
                            series.dataPoints.push({
                                x: xval,
                                label: label,
                                wk: parseInt(doc.wk),
                                y: 1,
                                pn: doc.pnum,
                                click: function () {
                                    barClick(series.ids, doc.pnum + '-' + label);
                                }
                            });
                        } else {
                            dPoint.y += 1;
                            series.ids.push(doc);
                        }
                    }

                    if (!_.contains(_charts.companies, doc.clnt)) {
                        _charts.companies.push(doc.clnt);
                    }
                    return _charts;
                }
            };
            return service;
        }
    ]);
