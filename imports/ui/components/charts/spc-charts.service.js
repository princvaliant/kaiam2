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
  .service('SpcChartsService', ['$translate', '$meteor', '$mdDialog',
    function($translate, $meteor, $mdDialog) {
      let _charts;
      let exclude;

      function create(doc, field, g1cap, g1, g2, rack, showAll, renderCallback) {
        if (_charts[field][g1] === undefined) {
          _charts[field][g1] = {
            zoomEnabled: true,
            zoomType: 'xy',
            animationEnabled: false,
            title: {
              text: g1cap + ' ' + g1,
              fontSize: 16,
              fontColor: 'DarkSlateGrey'
            },
            axisX: {
              title: '',
              labelAngle: -10,
              titleFontSize: 14
            },
            axisY: {
              title: '',
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
              itemclick: function(e) {
                if (typeof(e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
                  e.dataSeries.visible = false;
                } else {
                  e.dataSeries.visible = true;
                }
                renderCallback(g1, e.dataSeries.name);
              }
            }
          };
        }

        let c = _charts[field][g1];
        if (c.data === undefined) {
          c.data = [];
        }

        if (!c.limit) {
          c.limit = {
            'type': 'line',
            'name': 'LIMIT',
            showInLegend: true,
            dataPoints: []
          };
          c.data.push(c.limit);
        }

        // Add column definition for channel
        let series = _.find(c.data, function(item) {
          return item.name === g2;
        });

        if (series === undefined) {
          series = {
            'type': 'line',
            'name': g2,
            showInLegend: rack !== '',
            xValueType: 'dateTime',
            markerSize: 4,
            toolTipContent: "<span style='\"'color: {color};'\"'><strong>{sn}</strong></span><br/>Time: {time} <br/>Rack: {rack} <br/>{name}</span><br/>Value: </strong></span> {y}",
            dataPoints: []
          };
          c.data.push(series);
        }
        if (doc.data[field] < 100000000 && (showAll === true || exclude.sn.indexOf(doc._id) === -1)) {
          series.dataPoints.push({
            x: moment(doc.timestamp).valueOf(),
            label: moment(doc.timestamp).format('MM-DD-YYYY hh:mm'),
            y: doc.data[field],
            sn: doc.device.SerialNumber,
            rack: doc.meta.Rack,
            _id: doc._id,
            time: moment(doc.timestamp).format('MM-DD-YYYY hh:mm'),
            click: function(e) {
              let confirm = $mdDialog.confirm()
                .title('Would you like to remove point?')
                .ariaLabel('Remove point')
                .ok('Remove')
                .cancel('Cancel');
              $mdDialog.show(confirm).then(function() {
                TestdataExclude.update({ _id: exclude._id }, { $addToSet: { 'sn': e.dataPoint._id } });
                e.dataSeries.dataPoints = _.reject(e.dataSeries.dataPoints, function(el) {
                  return el._id === e.dataPoint._id;
                });
                e.chart.render();
              });
            }
          });
        }
      }

      return {
        construct: function(doc, field, grouping, rack, showAll, charts, renderCallback) {
          _charts = charts;
          if (_charts[field] === undefined) {
            _charts[field] = {};
          }
          if (grouping === 'slot') {
            create(doc, field, 'slot', doc.meta.DUT,
              rack === '' ? doc.meta.Rack + ' ' + doc.meta.Channel : 'chan ' + doc.meta.Channel, rack, showAll, renderCallback);
          } else {
            create(doc, field, 'chan', doc.meta.Channel,
              rack === '' ? doc.meta.Rack + ' ' + doc.meta.DUT : 'slot ' + doc.meta.DUT, rack, showAll, renderCallback);
          }
          return _charts;
        },

        // Subscribe to type and subtype and preserve state
        subscribe: function(type, subtype, rack, searchNumbers, device, subscribeCompleted) {
          $meteor.subscribe('testdataexclude').then(function() {
            exclude = TestdataExclude.findOne();
            if (exclude === undefined) {
              TestdataExclude.insert({
                sn: []
              });
            }
          });
          $meteor.subscribe('testdataspcs', type, subtype, rack, searchNumbers, device).then(function(subscriptionHandle) {
            if (subscriptionHandle.ready()) {
              $meteor.subscribe('spclimits').then(function() {
                subscribeCompleted();
              });
            }
          });
        },

        standardDeviation: function(values) {
          let avg = this.average(values);
          let squareDiffs = values.map(function(value) {
            let diff = value - avg;
            return diff * diff;
          });
          let avgSquareDiff = this.average(squareDiffs);
          return  Math.sqrt(avgSquareDiff);
        },

        average: function(data) {
          let sum = data.reduce(function(sum2, value) {
            return sum2 + value;
          }, 0);
          return  sum / data.length;
        }
      };
    }
  ]);
