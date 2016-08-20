'use strict';
/**
 * @ngdoc controller
 * @name ChartsController
 * @module KaiamApp
 * @kind function
 * @description
 *
 */

angular.module('kaiamCharts').
controller('TestSpeedController', [
  '$scope', '$state', '$mdToast', '$meteor', '$cookies', '$stateParams', '$location', ($scope, $state, $mdToast, $meteor, $cookies, $stateParams, $location) => {
    let chartsObjs;
    $scope.device = $cookies.get('testspeedDevice') || '40GB';
    $scope.changeDevice = (device) => {
      $scope.device = device;
      $cookies.put('testspeedDevice', device);
      get();
    };
    let chart = {
      data: [],
      animationEnabled: true,
      zoomEnabled: true,
      zoomType: 'xy',
      animationDuration: 200,
      title: {
        text: 'Test speed per rack [minutes]',
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
        includeZero: false
      },
      legend: {
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        fontSize: 11,
        fontColor: 'DarkSlateGrey',
        fontFamily: 'Tahoma',
        cursor: 'pointer',
        itemclick: function(e) {
          if (typeof(e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          chartsObjs.render();
        }
      }
    };

    get();

    function get() {
      chart.data = [];
      $meteor.call('getTestSpeed', $scope.device).then(
          function (testspeeds) {
            _.each(testspeeds, (ts) => {
              chart.data.push({
                type: 'line',
                legendText: ts._id,
                showInLegend: true,
                dataPoints: ts.points
              });
            });
            chartsObjs = new CanvasJS.Chart('testSpeedChart', chart);
            chartsObjs.render();
          });
    }
  }
]);
