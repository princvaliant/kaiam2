import angular from 'angular';

angular.module('kaiamCharts').controller('SpcChartsLimitsController', [
    '$scope', '$mdDialog', 'field', 'grp', 'rack', 'pn', 'refresh',
    ($scope, $mdDialog, field, grp, rack, pn, refresh) => {
        rack = rack || '';
        pn = pn || '';
        let spc = Spclimits.findOne({field: field, grp: grp + '', rack: rack, pn: pn});
        if (spc) {
            $scope.lowLimit = spc.low;
            $scope.highLimit = spc.high;
        }

        $scope.cancel = () => {
            $mdDialog.hide();
        };

        $scope.submit = () => {
            let low = null;
            let high = null;
            if (!isNaN($scope.lowLimit)) {
                low = parseFloat($scope.lowLimit);
            }
            if (!isNaN($scope.highLimit)) {
                high = parseFloat($scope.highLimit);
            }

            if (spc) {
                Spclimits.update(spc._id, {$set: {low: low, high: high}});
            } else {
                Spclimits.insert({
                    field: field,
                    grp: grp + '',
                    rack: rack,
                    pn: pn,
                    low: low,
                    high: high
                });
            }
            $mdDialog.hide();
            refresh();
        };
    }
]);
