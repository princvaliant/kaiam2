import angular from 'angular';

/**
 * @ngdoc function
 * @name DashboardController
 * @module kaiamDashboard
 * @kind function
 *
 *
 */
angular.module('kaiamDashboard').controller('DashboardController', ['$scope', '$reactive', '$timeout',
    function ($scope, $reactive, $timeout) {
        // $reactive(this).attach($scope);
        $scope.summaries = [];
        $scope.total = {};

        $scope.profile = Meteor.user().profile;

        $scope.subscribe('dashboard');
        $scope.helpers({
            dashboards: () => {
                return Dashboards.find();
            }
        });
        $scope.autorun(() => {
            $scope.summaries = [];
            $scope.total = {};
            $scope.getReactively('dashboards').forEach(processRow);
            $timeout(function () {
                $scope.widgetCtrl.setLoading(false);
            }, 100);
        });

        function processRow (obj) {
            let item = _.findWhere($scope.summaries, {
                name: obj.id.p
            });
            if (item === undefined) {
                item = {
                    name: obj.id.p
                };
                $scope.summaries.push(item);
            }
            if (item[obj.id.t + 'dok'] === undefined) {
                if ($scope.total[obj.id.t + 'dok'] === undefined) {
                    $scope.total[obj.id.t + 'dok'] = 0;
                    $scope.total[obj.id.t + 'dtot'] = 0;
                    $scope.total[obj.id.t + 'wok'] = 0;
                    $scope.total[obj.id.t + 'wtot'] = 0;
                }

                item[obj.id.t + 'dok'] = parseInt(obj.dok, 10) > 0 ? obj.dok : '';
                $scope.total[obj.id.t + 'dok'] += parseInt(obj.dok, 10);

                item[obj.id.t + 'dtot'] = parseInt(obj.dtot, 10) > 0 ? obj.dtot : '';
                $scope.total[obj.id.t + 'dtot'] += parseInt(obj.dtot, 10);

                item[obj.id.t + 'wok'] = parseInt(obj.wok, 10) > 0 ? obj.wok : '';
                $scope.total[obj.id.t + 'wok'] += parseInt(obj.wok, 10);

                item[obj.id.t + 'wtot'] = parseInt(obj.wtot, 10) > 0 ? obj.wtot : '';
                $scope.total[obj.id.t + 'wtot'] += parseInt(obj.wtot, 10);

                item[obj.id.t + 'dy'] = 100 * obj.dok / obj.dtot;
                item[obj.id.t + 'wy'] = 100 * obj.wok / obj.wtot;
            }
        }
    }
]);
