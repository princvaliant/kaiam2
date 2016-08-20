'use strict';
/**
 * @ngdoc service
 * @name SpcChartsService
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts')
  .service('YieldCheckService', ['$translate',
    function($translate) {
      CanvasJS.addColorSet('customColorSet', Settings.customColorSet);
      let visibility = {};
      let xval = 0;
      let label2 = '';
      let service = {
        construct: (doc, charts, title, renderCallback, pointClicked) => {
          let _charts = charts || {};
          if (_charts.title === undefined) {
            xval = 0;
            _charts = {
              zoomEnabled: true,
              zoomType: 'xy',
              animationDuration: 200,
              animationEnabled: true,
              title: {
                text: $translate.instant('MENU.CHARTS.YIELD') + ' ' +
                  $translate.instant('MENU.CHARTS.YIELD' + title),
                fontSize: 16,
                fontColor: 'DarkSlateGrey'
              },
              axisX: {
                title: '',
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
                interval: 10,
                maximum: 100
              },
              legend: {
                verticalAlign: 'bottom',
                horizontalAlign: 'center',
                fontSize: 11,
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
            return item.legendText === doc._id.pnum;
          });
          if (series === undefined) {
            let color = 'red';
            if (Settings.partNumbers[doc._id.pnum] && Settings.partNumbers[doc._id.pnum].color) {
                color = Settings.partNumbers[doc._id.pnum].color;
            }

            series = {
              type: 'line',
              legendText: doc._id.pnum,
              showInLegend: true,
              reversed: true,
              color: color,
              toolTipContent: "<span style='\"'color: {color};'\"'><strong>{pn}</strong><br/><br/>" +
                "X value: {label}<br/>Yield: {y}</strong><hr/>Pass: {pass}</strong><br/>Fail: {fail}</strong>" +
                "<br/>Total: {total}</strong></span><br/>",
              dataPoints: []
            };
            _charts.data.push(series);
          }
          series.visible = visibility[doc._id.pnum] === undefined ? true : visibility[doc._id.pnum];
          if (doc.fail + doc.pass > 0) {
            let y = parseInt(100 * doc.pass / (doc.fail + doc.pass));
            let label = parseInt(doc._id.w);
            if (doc._id.d) {
              label = doc._id.d;
            }
            if (label2 !== label) {
              xval += 1;
            }
            label2 = label;
            series.dataPoints.push({
              x: xval,
              label: label,
              label1: doc._id.w || doc._id.d,
              y: y,
              pn: doc._id.pnum,
              pass: doc.pass,
              fail: doc.fail,
              total: doc.pass + doc.fail,
              click: function(e) {
                pointClicked(e.dataPoint.pn, e.dataPoint.label1);
              }
            });
          }
          return _charts;
        }
      };
      return service;
    }
  ]);
