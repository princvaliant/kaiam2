'use strict';
/**
 * @ngdoc function
 * @name SpecActionsController
 * @module kaiamSpecActions
 * @kind function
 *
 *
 */
import './spec-actions-init.service';
import './spec-actions.service';


angular.module('kaiamSpecActions').controller('SpecActionsController', ['$rootScope', '$q', '$meteor', '$scope', '$filter',
    '$reactive', '$cookies', '$timeout', '$location', '$state', '$mdMedia', '$mdBottomSheet', '$stateParams', '$mdDialog',
    '$mdToast', '$window', 'Upload', 'SpecActionsInitService', 'SpecActionsService',
    function ($rootScope, $q, $meteor, $scope, $filter, $reactive, $cookies, $timeout, $location, $state, $mdMedia,
              $mdBottomSheet, $stateParams, $mdDialog, $mdToast, $window, Upload, SpecActionsInitService, SpecActionsService) {
        $reactive(this).attach($scope);

        let self = this;
        $scope.class = $stateParams.class;
        $scope.isAction = false;

        $scope.importedMessage = '';
        //   $scope.uploader = new FileUploader();
        $scope.selectedTab = $cookies.get('specActionsTabSelected') || 0;
        $scope.partNumbers = [''].concat(_.keys(Settings.partNumbers));
        $scope.partNumber = $cookies.get('specActionsPartNumber') || 'XQX4100';
        self.selectedPnum = $scope.partNumber;

        // Initialize all grids
        SpecActionsInitService.initSars($scope, this);
        SpecActionsInitService.initSarActionParams($scope, this);
        SpecActionsInitService.initSarActions($scope, this);
        SpecActionsInitService.initSarSpecRanges($scope, this);
        SpecActionsInitService.initSarSpecs($scope, this);

        $scope.changePartNumber = function (pn) {
            $scope.partNumber = pn;
            self.selectedPnum = pn;
            $cookies.put('specActionsPartNumber', pn);
        };

        $scope.addSarClick = function () {
            SpecActionsService.addSar($scope.partNumber, 'N', 'N', '', $scope.class);
        };
        $scope.removeSarClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision?')
                .ariaLabel('Remove revision')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSar($scope.sarApi.selection);
            });
        };
        $scope.copySarClick = function () {
            if (self.selectedSar) {
                showToast('Revision ' + self.selectedSar.name + ' copied to clipboard');
                $scope.copySar = self.selectedSar;
            }
        };
        $scope.pasteSarClick = function () {
            if ($scope.copySar) {
                SpecActionsService.pasteSar($scope.partNumber, $scope.copySar);
                showToast('Revision pasted from clipboard');
            }
        };
        $scope.lockSarClick = function () {
            if (self.selectedSar) {
                let confirm = $mdDialog.confirm()
                    .title('Would you like to lock selected revision ' +
                        self.selectedSar.name + ' (' + self.selectedSar.rev +
                        ') ? If locked can not be unlocked.')
                    .ariaLabel('Lock revision')
                    .ok('Lock')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    SpecActionsService.lockSar($scope.sarApi.selection);
                    showToast('Revision locked successfully');
                });
            }
        };

        $scope.addSarActionClick = function () {
            SpecActionsService.addSarAction(self.selectedSar, '', '');
        };
        $scope.removeSarActionClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision action?')
                .ariaLabel('Remove revision action')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSarAction($scope.sarActionApi.selection);
            });
        };

        $scope.addSarActionParamClick = function () {
            SpecActionsService.addSarActionParam(self.selectedSar, self.selectedSarAction, '', 0);
        };
        $scope.removeSarActionParamClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision action param?')
                .ariaLabel('Remove revision action param')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSarActionParam($scope.sarActionParamApi.selection);
            });
        };
        $scope.copySarActionClick = function () {
            if (self.selectedSarAction) {
                showToast('Action ' + self.selectedSarAction.name + ' copied to clipboard');
                $scope.copySarAction = self.selectedSarAction;
            }
        };
        $scope.pasteSarActionClick = function () {
            if ($scope.copySarAction) {
                SpecActionsService.pasteSarAction(self.selectedSar, $scope.copySarAction);
                showToast('Action pasted from clipboard');
            }
        };

        $scope.addSarSpecClick = function () {
            SpecActionsService.addSarSpec(self.selectedSar, '', '', '');
        };
        $scope.removeSarSpecClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision spec?')
                .ariaLabel('Remove revision spec')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSarSpec($scope.sarSpecApi.selection);
            });
        };

        $scope.addSarSpecRangeClick = function () {
            SpecActionsService.addSarSpecRange(self.selectedSar, self.selectedSarSpec, '', '', '', '');
        };
        $scope.removeSarSpecRangeClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision spec range?')
                .ariaLabel('Remove revision spec range')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSarSpecRange($scope.sarSpecRangeApi.selection);
            });
        };
        $scope.copySarSpecClick = function () {
            if (self.selectedSarSpec) {
                showToast('Spec ' + self.selectedSarSpec.type + ' copied to clipboard');
                $scope.copySarSpec = self.selectedSarSpec;
            }
        };
        $scope.pasteSarSpecClick = function () {
            if ($scope.copySarSpec) {
                SpecActionsService.pasteSarSpec(self.selectedSar, $scope.copySarSpec);
                showToast('Spec pasted from clipboard');
            }
        };

        $scope.addNodeClick = function () {
            SpecActionsService.addExecution(self.selectedSarAction);
        };

        $scope.upload = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                SpecActionsService.readFileAsync(resp.config.data.file).then(function (fileInputContent) {
                    SpecActionsService.updateFile(self.selectedSar, fileInputContent, resp.config.data.file.name);
                    showToast('File successfully imported');
                });
            });
        };

        $scope.$watch(
            'selectedExecution',
            function handleFooChange (newValue) {
                if (self.selectedSar) {
                    let nv = angular.copy(newValue);
                    Sar.update({_id: self.selectedSar._id}, {$set: {execution: nv}});
                }
            }, true
        );

        this.subscribe('sars', () => {
            $scope.gridSars.data = Sar.find({
                pnum: self.getReactively('selectedPnum'),
                class: {$in: [$scope.class, null]}
            }).fetch();
            $timeout(function () {
                let isSel = false;
                $scope.sarApi.grid.rows.forEach(function (row) {
                    if (self.selectedSar && self.selectedSar._id === row.entity._id) {
                        $scope.sarApi.selection.selectRow(row.entity);
                        isSel = true;
                    }
                });
                if (isSel === false) {
                    if ($scope.gridSars.data[0]) {
                        $scope.sarApi.selection.selectRow($scope.gridSars.data[0]);
                    } else {
                        $scope.gridSarActions.data = [];
                        $scope.gridSarActionParams.data = [];
                        $scope.gridSarSpecs.data = [];
                        $scope.gridSarSpecRanges.data = [];
                    }
                }
            });
        });
        $scope.tabSelected = (idx, field) => {
            $cookies.put('specActionsTabSelected', idx);
            $timeout(function () {
                initTab(field);
            });
        };
        $scope.calcSpecClicked = () => {
            if (self.selectedSar) {
                let confirm = $mdDialog.confirm()
                    .title('Would you like to recalculate ' + self.selectedSar.name + ' ' + self.selectedSar.rev + '?')
                    .ariaLabel('Re-calculate spec')
                    .ok('Submit')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    SpecActionsService.recalculateSar(self.selectedSar, $scope.recalcSnList, $scope.recalcFromDate, $scope.recalcToDate);
                    showToast('Recalculation successfully started');
                });
            }
        };
        function initTab (field) {
            switch (field) {
                case 'actionEdit':
                    self.subscribe('sar-actions', () => {
                        if (self.getReactively('selectedSar')) {
                            $scope.gridSarActions.data = SarAction.find({sarId: self.selectedSar._id}, {sort: {order: 1}}).fetch();
                            $timeout(function () {
                                if ($scope.sarActionApi.selection && $scope.gridSarActions.data[0]) {
                                    $scope.sarActionApi.selection.selectRow($scope.gridSarActions.data[0]);
                                } else {
                                    $scope.gridSarActionParams.data = [];
                                }
                            });
                        }
                    });

                    self.subscribe('sar-action-params', () => {
                        if (self.getReactively('selectedSarAction')) {
                            $scope.gridSarActionParams.data = SarActionParam.find({sarActionId: self.selectedSarAction._id}).fetch();
                        }
                    });
                    break;
                case 'specEdit':
                    self.subscribe('sar-specs', () => {
                        if (self.getReactively('selectedSar')) {
                            $scope.gridSarSpecs.data = SarSpec.find({sarId: self.selectedSar._id}).fetch();
                            $timeout(function () {
                                if ($scope.sarSpecApi.selection && $scope.gridSarSpecs.data[0]) {
                                    $scope.sarSpecApi.selection.selectRow($scope.gridSarSpecs.data[0]);
                                } else {
                                    $scope.gridSarSpecRanges.data = [];
                                }
                            });
                        }
                    });

                    self.subscribe('sar-spec-ranges', () => {
                        if (self.getReactively('selectedSarSpec')) {
                            $scope.gridSarSpecRanges.data = SarSpecRange.find({sarSpecId: self.selectedSarSpec._id}).fetch();
                        }
                    });
                    break;
                case 'specCalc':
                    self.autorun(() => {
                        if (self.getReactively('selectedSar')) {
                            $scope.recalcSnList = self.selectedSar.recalcSnList;
                            $scope.recalcFromDate = self.selectedSar.recalcFromDate;
                            $scope.recalcToDate = self.selectedSar.recalcToDate;
                            $scope.recalcShowProgress = self.selectedSar.recalcForce;
                        }
                    });
                    break;
                case 'actionView':
                    self.autorun(() => {
                        self.call('getActions', self.getReactively('selectedSar'), (err, data) => {
                            $scope.actions = data;
                        });
                    });
                    break;
                case 'specView':
                    self.autorun(() => {
                        self.call('getSpecs', self.getReactively('selectedSar'), (err, data) => {
                            $scope.specs = data;
                        });
                    });
                    break;
                case 'log':
                    self.autorun(() => {
                        self.call('getLogs', self.getReactively('selectedSar'), (err, data) => {
                            $scope.logs = data;
                            console.log(data);
                        });
                    });
                    break;
                default:
                    break;
            }
        }

        function showToast (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .content(msg)
                    .position('top left')
                    .hideDelay(3000));
        }
    }
]);