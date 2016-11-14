import angular from 'angular';

/**
 * @ngdoc function
 * @name DashboardController
 * @module kaiamDashboard
 * @kind function
 *
 *
 */
angular.module('kaiamDashboard').controller('DashboardController', ['$scope', '$reactive', '$timeout', '$document', 'ExportDataService',
    function ($scope, $reactive, $timeout, $document, ExportDataService) {
        // $reactive(this).attach($scope);
        $scope.summaries = [];
        $scope.total = {};

        $scope.profile = Meteor.user().profile;
        $scope.isClient = Meteor.user().profile.isClient === 'Y';

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

        $scope.exportClick = () => {
            Meteor.call('exportDashboard', (err, data) => {
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content($translate.instant('Dashboard export error') + ' ' + err)
                            .position('top right')
                            .hideDelay(5000));
                } else {
                    let ret = ExportDataService.exportData(data, 'dashboard_export', '', '');
                    let blob = new Blob([ret.substring(1)], {type: 'data:text/csv;charset=utf-8'});
                    $scope.filename = 'dashboard_export.csv';
                    if (window.navigator.msSaveOrOpenBlob) {
                        navigator.msSaveBlob(blob, $scope.filename);
                    } else {
                        let downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
                        let downloadLink = angular.element(downloadContainer.children()[0]);
                        downloadLink.attr('href', (window.URL || window.webkitURL).createObjectURL(blob));
                        downloadLink.attr('download', $scope.filename);
                        downloadLink.attr('target', '_blank');
                        $document.find('body').append(downloadContainer);
                        $timeout(function () {
                            downloadLink[0].click();
                            downloadLink.remove();
                            $scope.showProgress = false;
                        }, null);
                    }
                }
            });
        };

        function processRow (obj) {

            let item = _.findWhere($scope.summaries, {
                name: obj.p
            });
            if (item === undefined) {
                item = {
                    name: obj.p
                };
                $scope.summaries.push(item);
            }
            if (item[obj.t + 'wok'] === undefined) {
                $scope.total[obj.t + 'wok'] = 0;
                $scope.total[obj.t + 'wtot'] = 0;
            }

            let date = moment().format('YYYY-MM-DD');
            if (date === obj.d) {
                if ($scope.total[obj.t + 'dok'] === undefined) {
                    $scope.total[obj.t + 'dok'] = 0;
                    $scope.total[obj.t + 'dtot'] = 0;
                }
                item[obj.t + 'dok'] = obj.dok;
                $scope.total[obj.t + 'dok'] += obj.dok;

                item[obj.t + 'dtot'] = obj.dtot;
                $scope.total[obj.t + 'dtot'] += obj.dtot;
                item[obj.t + 'dy'] = 100 * obj.dok / obj.dtot;
            }

            item[obj.t + 'wok'] = obj.wok;
            $scope.total[obj.t + 'wok'] += obj.wok;

            item[obj.t + 'wtot'] = obj.wtot;
            $scope.total[obj.t + 'wtot'] += obj.wtot;

            item[obj.t + 'wy'] = 100 * obj.wok / obj.wtot;
        }
    }
]);
