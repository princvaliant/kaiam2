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
  .service('PackoutChartsService', [
    function() {
      CanvasJS.addColorSet('customColorSet', Settings.customColorset);
      let isfd;
      let isfw;
      let xval = 0;
      let label2 = '';
      let service = {
        construct: function(doc, charts, manufacturer, interval, renderCallback, barClick) {
          let _charts = charts;
          if (_charts === null) {
            xval = 0;
            _charts = {
              animationEnabled: true,
              animationDuration: 600,
              colorSet: 'customColorSet',
              title: {
                text: interval + ' packouts',
                fontSize: 16,
                fontColor: 'DarkSlateGrey'
              },
              axisX: {
                valueFormatString: '-',
                interval: 2,
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
                itemclick: function(e) {
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
            _charts.manufacturers = ['-all-'];
            isfd = doc.id.n;
            isfw = doc.id.wk;
          }

          if (doc.id.n === isfd || doc.id.wk === isfw) {
            return _charts;
          }

          if (manufacturer === '-all-' || manufacturer === doc.id.cm) {
            // Create series
            let series = _.find(_charts.data, function(item) {
              return item.legendText === doc.id.pnum;
            });
            if (series === undefined) {
              series = {
                type: 'stackedColumn',
                legendText: doc.id.pnum,
                color: (Settings.partNumbers[doc.id.pnum] && Settings.partNumbers[doc.id.pnum].color) ? Settings.partNumbers[doc.id.pnum].color : 'red',
                showInLegend: true,
                toolTipContent: "<span style='\"'color: {color};'\"'><strong>{pn}</strong><br/><br/>Date: {label}<br/>Value: {y}</strong></span>",
                dataPoints: []
              };
              _charts.data.push(series);
            }
            if (interval === 'Daily') {
              let dPoint = _.find(series.dataPoints, function(item) {
                return item.label.localeCompare(doc.id.ts) === 0 && item.pn.localeCompare(doc.id.pnum) === 0;
              });
              if (dPoint === undefined) {
                if (doc.id.ts !== label2) {
                  xval += 1;
                }
                label2 = doc.id.ts;
                series.dataPoints.push({
                  x: xval,
                  label: doc.id.ts,
                  y: doc.cnt,
                  pn: doc.id.pnum,
                  click: function(e) {
                    barClick(e.dataPoint);
                  }
                });
              } else {
                dPoint.y += doc.cnt;
              }
            }
            if (interval === 'Weekly') {
              let wk = doc.id.n < '2016000' ? parseInt(doc.id.wk) + 1 : parseInt(doc.id.wk);
              let label = 'Week ' + wk;
              let dPoint = _.find(series.dataPoints, function(item) {
                return item.label.localeCompare(label) === 0 && item.pn.localeCompare(doc.id.pnum) === 0;
              });
              if (dPoint === undefined) {
                if (label !== label2) {
                  xval += 1;
                }
                label2 = label;
                series.dataPoints.push({
                  x: xval,
                  label: label,
                  wk: parseInt(doc.id.wk),
                  y: doc.cnt,
                  pn: doc.id.pnum,
                  click: function(e) {
                    barClick(e.dataPoint);
                  }
                });
              } else {
                dPoint.y += doc.cnt;
              }
            }
          }
          if (!_.contains(_charts.manufacturers, doc.id.cm)) {
            _charts.manufacturers.push(doc.id.cm);
          }
          return _charts;
        }
      };
      return service;
    }
  ]);
