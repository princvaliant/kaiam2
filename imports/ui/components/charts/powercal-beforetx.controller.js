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
controller('PowercalbeforetxController', [
  '$scope', '$mdToast', '$cookies', '$translate', '$meteor', '$stateParams', '$location', 'SpcChartsService', ($scope, $mdToast, $cookies, $translate, $meteor, $stateParams, $location, SpcChartsService) => {
    $scope.dateFrom = $cookies.get('powercalDateFrom') ?
      new Date($cookies.get('powercalDateFrom')) : moment().subtract(10, 'days').toDate();
    $scope.dateTo = $cookies.get('powercalDateTo') ?
      new Date($cookies.get('powercalDateTo')) : moment().toDate();
    $meteor.autorun($scope, () => {
      $scope.$meteorSubscribe('powercalbeforetx',
        $scope.getReactively('dateFrom'), $scope.getReactively('dateTo')
      ).then(() => {
        processData();
      });
    });

    function processData() {
      let list = [];
      Powercalbeforetx.find({
        'id.t': {
          $gte: moment($scope.dateFrom).format('YYYY-MM-DD'),
          $lte: moment($scope.dateEnd).format('YYYY-MM-DD')
        }
      }, {
        sort: {
          'id.r': 1,
          'id.d': 1
        }
      }).forEach((row) => {
        let key = {
          r: row.id.r,
          d: row.id.d
        };
        let obj = _.findWhere(list, key);
        if (obj === undefined) {
          obj = key;
          list.push(obj);
        }
        if (!obj[row.id.c]) {
          obj[row.id.c] = [];
        }
        // Append 2 arrays
        obj[row.id.c] = row.v.reduce((coll, item) => {
          coll.push(item);
          return coll;
        }, obj[row.id.c]);
      });
      _.each(list, (o) => {
        for (let c in o) {
          if (_.isArray(o[c])) {
            o[c] = SpcChartsService.standardDeviation(o[c]).toFixed(4);
          }
        }
      });
      $scope.data = list;
      $scope.widgetCtrl.setLoading(false);
    }

    //SpcChartsService.standardDeviation(arr);

    $scope.dateFromChanged = function(date) {
      $cookies.put('powercalDateFrom', date);
      $scope.dateFrom = date;
      $scope.widgetCtrl.setLoading(true);
    };

    $scope.dateToChanged = function(date) {
      $cookies.put('powercalDateTo', date);
      $scope.dateTo = date;
      $scope.widgetCtrl.setLoading(true);
    };

    $scope.getColor = function(val) {
      if (val >= 0 && val < 0.06) {
        return 'c1';
      }
      if (val >= 0.06 && val < 0.12) {
        return 'c2';
      }
      if (val >= 0.12 && val < 0.18) {
        return 'c3';
      }
      if (val >= 0.18 && val < 100) {
        return 'c4';
      }
    };
  }
]);
