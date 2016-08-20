'use strict';

import angular from 'angular';
import './trend-charts.service';

/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').
controller('TimetrendChartsController', [
  '$scope', '$mdToast', '$meteor', '$stateParams', '$location', 'TimetrendChartsService',
  function($scope, $mdToast, $meteor, $stateParams, $location, TimetrendChartsService) {
    let reset = false;
    // Retrieve what is the test type (txtest, rxtest etc.)
    $scope.testType = $stateParams.type;
    $scope.testSubType = $stateParams.subtype;
    $scope.showProgress = false;
    // Select first tab
    $scope.selectedIndex = 0;
    // Initialize list for part number dropdown
    $scope.partNumbers = [''];
    // Initialize list for manufacturer dropdown
    $scope.manufacturers = [''];
    // Interval for the data
    $scope.intervals = $scope.intervals = _.keys(Settings.lossintervals);
    $scope.interval = $scope.intervals[0];

    $scope.partNumbers = [''].concat(_.keys(Settings.partNumbers));
    $scope.manufacturers = _.union([''], Settings.manufacturers);

    // Event handler when interval changed
    $scope.changeInterval = function(i) {
      $scope.interval = i;
      subs();
    };

    // Event handler for variable name
    $scope.changeVariable = function(i) {
      $scope.variable = i;
      subs();
    };

    // Event handler when part number changed
    $scope.changePartNumber = function(pn) {
      $scope.partNumber = pn;
      initVars();
      subs();
    };

    // Event handler when manufacturer changed
    $scope.changeManufacturer = function(manufacturer) {
      $scope.manufacturer = manufacturer;
      subs();
    };

    $scope.searchClick = function(srch) {
      $scope.search = srch;
      subs();
    };

    // Event handler when export clicked
    $scope.exportClick = function() {
      $scope.showProgress = true;
      let ret = '';
      _.each($scope.data, function(item) {
        let row = '';
        let head = ',';
        for (let v in item) {
          if (v === 'id') {
            for (let v2 in item[v]) {
              if (_.indexOf(['y', 'm', 'd', 'h1', 'h8', 'min', 'sec', 'msec'], v2) === -1) {
                head += v2 + ',';
                row += item[v][v2] + ',';
              }
            }
          } else if (v === 'meta' || v === 'device' || v === 'data') {
            for (let v2 in item[v]) {
              head += v2 + ',';
              row += item[v][v2] + ',';
            }
          } else if (v === 'ts' || v === 'timestamp') {
            head += v + ',';
            row += moment(item[v]).format('YYYY-MM-DD HH:mm:ss') + ',';
          } else if (v !== '_id') {
            head += v + ',';
            row += item[v] + ',';
          }
        }
        if (ret === '') {
          ret += head + '\n';
        }
        ret += row + '\n';
      });
      if (ret) {
        let blob = new Blob([ret.substring(1)], {type: 'data:text/csv'});
        $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
        $scope.filename = 'losses-' + (tt || 'all') + '.csv';
        setTimeout(() => {
          let a = document.getElementById('trenddataexportlink');
          $scope.showProgress = false;
          a.click();
        }, 500);
      } else {
        $scope.showProgress = false;
      }
    };

    // Call subscription all for the first initialization
    initVars();
    subs();

    function subs() {
      if ($scope.widgetCtrl) {
        $scope.widgetCtrl.setLoading(true);
      }
      $scope.charts = {};
      $scope.chartsObjs = {};
      let tot = 40;
      if ($scope.interval === 'INTERVAL_LAST30DAYS') {
        tot = 20;
      }
      if ($scope.interval === 'INTERVAL_LAST90DAYS') {
        tot = 8;
      }
      for (let idx = 1; idx <= tot; idx++) {
        setTimeout( () => {
          subs2(idx);
        }, 5 * idx);
      }
    }

    function initVars() {
      // Initialize list for part family dropdown
      let ttd1 = Settings.getTestConfigVariablesForPartNumber( $scope.partNumber || 'XQX3202', $scope.testType, $scope.testSubType);
      $scope.variables = _.pluck(ttd1, 'v');
      $scope.variable = $scope.variables[0];
    }

    function subs2(idx) {
      $meteor.call('getTrends',
        $scope.testType, $scope.testSubType, $scope.variable, $scope.search,
        $scope.partNumber, $scope.manufacturer, Settings.lossintervals[$scope.interval], idx).then(
        function(data) {
          $scope.widgetCtrl.setLoading(false);
          if (reset === true) {

          }
          _.each(data, (doc) => {
            $scope.charts = TimetrendChartsService.construct(doc, $scope.variable, $scope.charts, function() {
              if ($scope.chartsObjs !== undefined) {
                $scope.chartsObjs[doc.c].render();
              }
            });
          });
          for (let key in $scope.charts) {
            if (!$scope.chartsObjs[key]) {
              $scope.chartsObjs[key] = new CanvasJS.Chart('timetrend' + key,
                $scope.charts[key]);
            }
            $scope.chartsObjs[key].render();
          }
        }
      );
    }
  }
]);
