'use strict';

import angular from 'angular';
import './packout-charts.service';

/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */


angular.module('kaiamCharts').
controller('PackoutChartsController', [
  '$scope', '$mdToast', '$meteor', '$stateParams', '$cookies', '$location', 'PackoutChartsService', ($scope, $mdToast, $meteor, $stateParams, $cookies, $location, PackoutChartsService) => {
    $scope.manufacturer = '';
    $scope.interval = $cookies.get('packoutInterval') || 'Daily';
    // Event handler when manufacturer changed
    $scope.changeManufacturer = (manufacturer) => {
      $scope.manufacturer = manufacturer;
      processRows();
    };
    $scope.changeInterval = (interval) => {
      $scope.interval = interval;
      $cookies.put('packoutInterval', interval);
      processRows();
    };
    // Event handler when export clicked
    $scope.exportClick = () => {
      let ret = '';
      let yields = Packouts.find({}).fetch();
      _.each(yields, (item) => {
        let row = '';
        let head = '';
        for (let v in item) {
          if (v === 'id') {
            for (let v2 in item[v]) {
              head = v2 + ',' + head;
              row = item[v][v2] + ',' + row;
            }
          } else if (v !== '_id') {
            head = v + ',' + head;
            row = item[v] + ',' + row;
          }
        }
        if (ret === '') {
          ret += ',' + head + '\n';
        }
        ret += row + '\n';
      });

      let a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = encodeURI('data:text/csv;' + ret);
      a.download = 'packouts.csv';
      a.click();
    };

    let processRowsDebounce = _.debounce(processRows, 10000, true);

    $meteor.subscribe('packout').then(() => {
      $scope.packouts = $meteor.collection(Packouts);
    });
    $scope.$watchCollection('packouts', (newValue) => {
      if (newValue !== undefined) {
        processRowsDebounce();
      }
    });

    function processRows() {
      $scope.charts = null;
      $scope.chartsObjs = null;
      $scope.packouts.forEach(processRow);
      $scope.manufacturers = $scope.charts.manufacturers;
      if ($scope.manufacturers !== undefined) {
        $scope.manufacturers.sort();
      }
      initData();
    }

    function processRow(doc) {
      $scope.charts = PackoutChartsService.construct(doc, $scope.charts, $scope.manufacturer, $scope.interval, () => {
        if ($scope.chartsObjs !== null) {
          $scope.chartsObjs.render();
        }
      }, (dp) => {
        exportData(dp);
      });
    }

    // Executed when switching between tabs. Add data to created charts.
    function initData() {
      setTimeout(() => {
        if ($scope.charts !== null) {
          $scope.charts.data =  _.sortBy($scope.charts.data, 'legendText');
          if (document.querySelector('#packoutChart') !== null) {
            $scope.chartsObjs = new CanvasJS.Chart('packoutChart', $scope.charts);
            $scope.chartsObjs.render();
          }
        }
        $scope.widgetCtrl.setLoading(false);
      }, 2000);
    }

    function exportData(t) {
      if (t) {
        let query = {
          'id.pnum': t.pn
        };
        if ($scope.manufacturer) {
          query.cm = $scope.manufacturer;
        }
        if (t.label.length === 10) {
          query.ts = t.label;
        } else {
          query.wk = t.wk + '';
        }
        $meteor.subscribe('packoutexports', query).then((subhandle) => {
          let packouts = PackoutsExports.find(query).fetch();
          let ret = '';
          _.each(packouts, (item) => {
            let row = '';
            let head = ',';
            for (let v in item) {
              switch (v) {
                case 'id':
                  for (let v2 in item[v]) {
                    head += v2 + ',';
                    row += item[v][v2] + ',';
                  }
                  break;
                default:
                  head += v + ',';
                  row += item[v] + ',';
                  break;
              }
            }
            if (ret === '') {
              ret += head + '\n';
            }
            ret += row + '\n';
          });
          let a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          a.href = encodeURI('data:attachment/csv;charset=utf-8;' + ret);
          a.download = 'packouts' + t.label + '.csv';
          a.click();
          subhandle.stop();
        });
      }
    }
  }
]);
