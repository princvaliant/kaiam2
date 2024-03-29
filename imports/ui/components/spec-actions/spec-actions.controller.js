'use strict';
/**
 * @ngdoc function
 * @name SpecActionsController
 * @module kaiamSpecActions
 * @kind function
 *
 *
 */
import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './spec-actions-init.service';
import './spec-actions.service';


angular.module('kaiamSpecActions').controller('SpecActionsController', ['$rootScope', '$q', '$document', '$scope', '$filter',
    '$reactive', '$cookies', '$timeout', '$location', '$state', '$mdMedia', '$mdBottomSheet', '$stateParams', '$mdDialog',
    '$mdToast', '$window', 'Upload', 'SpecActionsInitService', 'SpecActionsService', 'ExportDataService',
    function ($rootScope, $q, $document, $scope, $filter, $reactive, $cookies, $timeout, $location, $state, $mdMedia,
              $mdBottomSheet, $stateParams, $mdDialog, $mdToast, $window, Upload, SpecActionsInitService, SpecActionsService, ExportDataService) {
        $reactive(this).attach($scope);

        $scope.class = $stateParams.class;
        $scope.isAction = false;
        $scope.newPart = {};
        $scope.calcObj = {};
        $scope.convbins = {};

        $scope.importedMessage = '';
        //   $scope.uploader = new FileUploader();
        $scope.selectedTab = $cookies.get('specActionsTabSelected') || 0;
        $scope.partNumbers = [''];
        let pnumms = PartNumbers.find({primary: true}).fetch();
        _.each(pnumms, (pnumm) => {
            $scope.partNumbers.push(pnumm.name);
        });
        $scope.partNumbers.sort();
        $scope.partNumber = $cookies.get('specActionsPartNumber') || 'XQX4000';

        refreshBins();
        refreshConversions();

        // Initialize all grids
        SpecActionsInitService.initSars($scope);
        SpecActionsInitService.initSarActionParams($scope);
        SpecActionsInitService.initSarActions($scope);
        SpecActionsInitService.initSarSpecRanges($scope);
        SpecActionsInitService.initSarSpecs($scope);
        SpecActionsInitService.initSarFlows($scope);

        $scope.changePartNumber = function (pn) {
            $scope.partNumber = pn;
            refreshBins();
            refreshConversions();
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
            if ($scope.selectedSar) {
                showToast('Revision ' + $scope.selectedSar.name + ' copied to clipboard');
                $scope.copySar = $scope.selectedSar;
            }
        };
        $scope.pasteSarClick = function () {
            if ($scope.copySar) {
                SpecActionsService.pasteSar($scope.partNumber, $scope.copySar);
                showToast('Revision pasted from clipboard');
            }
        };
        $scope.lockSarClick = function () {
            if ($scope.selectedSar) {
                let confirm = $mdDialog.confirm()
                    .title('Would you like to lock selected revision ' +
                        $scope.selectedSar.name + ' (' + $scope.selectedSar.rev +
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
        $scope.exportSarClick = function () {
            let methodName = 'exportActions';
            if ($scope.class === 'SPEC') {
                methodName = 'exportSpecs';
            }
            if ($scope.class === 'FILE') {
                methodName = 'exportFile';
            }
            Meteor.call(methodName, $scope.selectedSar._id, (err, data) => {
                let csvData;
                let fileName;
                if ($scope.class === 'FILE') {
                    csvData = ',' + data[0].fileContent;
                    fileName = data[0].fileName;
                } else {
                    csvData = ExportDataService.exportData(data);
                    fileName = methodName + '-' + $scope.selectedSar.name + ' ' + $scope.selectedSar.rev + '.csv';
                }
                let blob = new Blob([csvData.substring(1)], {type: 'data:text/csv;charset=utf-8'});
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, fileName);
                } else {
                    let downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
                    let downloadLink = angular.element(downloadContainer.children()[0]);
                    downloadLink.attr('href', (window.URL || window.webkitURL).createObjectURL(blob));
                    downloadLink.attr('download', fileName);
                    downloadLink.attr('target', '_blank');
                    $document.find('body').append(downloadContainer);
                    $timeout(function () {
                        downloadLink[0].click();
                        downloadLink.remove();
                    }, null);
                }
            });
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
        $scope.addSarActionClick = function () {
            SpecActionsService.addSarAction($scope.selectedSar, '', '');
        };

        $scope.addSarActionParamClick = function () {
            SpecActionsService.addSarActionParam($scope.selectedSar, $scope.selectedSarAction, '', 0);
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
            if ($scope.selectedSarAction) {
                showToast('Action ' + $scope.selectedSarAction.name + ' copied to clipboard');
                $scope.copySarAction = $scope.selectedSarAction;
            }
        };
        $scope.pasteSarActionClick = function () {
            if ($scope.copySarAction) {
                SpecActionsService.pasteSarAction($scope.selectedSar, $scope.copySarAction);
                showToast('Action pasted from clipboard');
            }
        };

        $scope.renumberSarActionClick = function () {
            let i = 20;
            if ($scope.sarActionApi && $scope.canEdit()) {
                $scope.sarActionApi.grid.rows.forEach(function (row) {
                    row.entity.order = i;
                    SpecActionsService.updateSarAction(row.entity);
                    i += 20;
                });
            }
            showToast('Actions successfully re-numbered');
        };

        $scope.addSarSpecClick = function () {
            SpecActionsService.addSarSpec($scope.selectedSar, '', '', '');
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
            SpecActionsService.addSarSpecRange($scope.selectedSar, $scope.selectedSarSpec, '', '', '', '');
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
            if ($scope.selectedSarSpec) {
                showToast('Spec ' + $scope.selectedSarSpec.type + ' copied to clipboard');
                $scope.copySarSpec = $scope.selectedSarSpec;
            }
        };
        $scope.pasteSarSpecClick = function () {
            if ($scope.copySarSpec) {
                SpecActionsService.pasteSarSpec($scope.selectedSar, $scope.copySarSpec);
                showToast('Spec pasted from clipboard');
            }
        };

        $scope.addSarFlowClick = function () {
            SpecActionsService.addSarFlow($scope.selectedSar, '', '', '', '', '', '');
        };
        $scope.removeSarFlowClick = function () {
            let confirm = $mdDialog.confirm()
                .title('Would you like to remove revision flow?')
                .ariaLabel('Remove revision flow')
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                SpecActionsService.removeSarFlow($scope.sarFlowApi.selection);
            });
        };

        $scope.addNodeClick = function () {
            SpecActionsService.addExecution($scope.selectedSarAction);
        };

        $scope.addConversionClicked = function () {
            Meteor.call('addConversion', $scope.partNumber, $scope.newPart.conversion, (err) => {
                if (err) {
                    showToast($scope.newPart.conversion + ' part number already assigned somewhere else');
                } else {
                    refreshConversions();
                    $scope.newPart.conversion = '';
                    $window.document.getElementById('conversionPart').focus();
                }
            });
        };

        $scope.addBinClicked = function () {
            Meteor.call('addBin', $scope.partNumber, $scope.newPart.bin, (err) => {
                if (err) {
                    showToast($scope.newPart.bin + ' part number already assigned somewhere else');
                } else {
                    refreshBins();
                    $scope.newPart.bin = '';
                    $window.document.getElementById('binPart').focus();
                }
            });
        };

        $scope.removeConversionClicked = function (conversion) {
            Meteor.call('removeConversion', $scope.partNumber, conversion, (err) => {
                if (err) {
                    showToast(err);
                } else {
                    refreshConversions();
                }
            });
        };

        $scope.removeBinClicked = function (bin) {
            Meteor.call('removeBin', $scope.partNumber, bin, (err) => {
                if (err) {
                    showToast(err);
                } else {
                    refreshBins();
                }
            });
        };


        $scope.upload = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                SpecActionsService.readFileAsync(resp.config.data.file).then(function (fileInputContent) {
                    SpecActionsService.updateFile($scope.selectedSar, fileInputContent, resp.config.data.file.name);
                    showToast('File successfully imported');
                });
            });
        };

        $scope.$watch(
            'selectedExecution',
            function handleFooChange (newValue) {
                if ($scope.selectedSar) {
                    let nv = angular.copy(newValue);
                    Sar.update({_id: $scope.selectedSar._id}, {$set: {execution: nv}});
                }
            }, true
        );

        $scope.subscribe('sars', () => {
            return [$scope.getReactively('partNumber'), $scope.getReactively('class')];
        });
        $scope.autorun(() => {
            $scope.gridSars.data = $scope.getReactively('sars');
            $timeout(function () {
                let isSel = false;
                $scope.sarApi.grid.rows.forEach(function (row) {
                    if ($scope.selectedSar && $scope.selectedSar._id === row.entity._id) {
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
                        $scope.gridSarFlows.data = [];
                    }
                }
            });
        });
        $scope.helpers({
            sars: () => {
                return Sar.find({
                    pnum: $scope.getReactively('partNumber'),
                    class: {$in: [$scope.getReactively('class'), null]}
                });
            },
            sarActions: () => {
                if ($scope.getReactively('selectedSar')) {
                    return SarAction.find({sarId: $scope.selectedSar._id}, {sort: {order: 1}});
                }
                return null;
            },
            sarActionParams: () => {
                if ($scope.getReactively('selectedSarAction')) {
                    return SarActionParam.find({sarActionId: $scope.selectedSarAction._id});
                }
                return null;
            },
            sarSpecs: () => {
                if ($scope.getReactively('selectedSar')) {
                    return SarSpec.find({sarId: $scope.selectedSar._id});
                }
                return null;
            },
            sarSpecRanges: () => {
                if ($scope.getReactively('selectedSarSpec')) {
                    return SarSpecRange.find({sarSpecId: $scope.selectedSarSpec._id});
                }
                return null;
            },
            sarFlows: () => {
                if ($scope.getReactively('selectedSar')) {
                    return SarFlow.find({sarId: $scope.selectedSar._id});
                }
                return null;
            },
        });

        $scope.autorun(() => {
            let selectedSar = $scope.getReactively('selectedSar') || {};
            $scope.subscribe('sar-actions', () => {
                return [selectedSar._id];
            });
            $scope.subscribe('sar-action-params', () => {
                return [selectedSar._id];
            });
            $scope.subscribe('sar-specs', () => {
                return [selectedSar._id];
            });
            $scope.subscribe('sar-spec-ranges', () => {
                return [selectedSar._id];
            });
            $scope.subscribe('sar-flows', () => {
                return [selectedSar._id];
            });
        });

        $scope.autorun(() => {
            $scope.gridSarActions.data = $scope.getReactively('sarActions') || [];
            $timeout(function () {
                if ($scope.sarActionApi && $scope.sarActionApi.selection && $scope.gridSarActions.data[0]) {
                    $scope.sarActionApi.selection.selectRow($scope.gridSarActions.data[0]);
                } else {
                    $scope.gridSarActionParams.data = [];
                }
            });
        });

        $scope.autorun(() => {
            $scope.gridSarSpecs.data = $scope.getReactively('sarSpecs') || [];
            $timeout(function () {
                if ($scope.sarSpecApi && $scope.sarSpecApi.selection && $scope.gridSarSpecs.data[0]) {
                    $scope.sarSpecApi.selection.selectRow($scope.gridSarSpecs.data[0]);
                } else {
                    $scope.gridSarSpecRanges.data = [];
                }
            });
        });

        $scope.autorun(() => {
            $scope.gridSarFlows.data = $scope.getReactively('sarFlows') || [];
            $timeout(function () {
                if ($scope.sarFlowApi && $scope.sarFlowApi.selection && $scope.gridSarFlows.data[0]) {
                    $scope.sarFlowApi.selection.selectRow($scope.gridSarFlows.data[0]);
                }
            });
        });

        $scope.autorun(() => {
            $scope.gridSarActionParams.data = $scope.getReactively('sarActionParams') || [];
        });

        $scope.autorun(() => {
            $scope.gridSarSpecRanges.data = $scope.getReactively('sarSpecRanges') || [];
        });

        $scope.tabSelected = (idx, field) => {
            $cookies.put('specActionsTabSelected', idx);
            $timeout(function () {
                initTab(field);
            });
        };

        $scope.calcSpecFromDateClicked = () => {
            setTimeout(() => {
            if ($scope.selectedSar && $scope.calcObj.recalcFromDate) {
                let confirm = $mdDialog.confirm()
                    .title('Would you like to recalculate ' + $scope.selectedSar.name + ' ' + $scope.selectedSar.rev + ' from date/time ' +
                        moment($scope.calcObj.recalcFromDate).format('MM/DD/YYYY') + ' ' + ($scope.calcObj.recalcFromHour || 0) + ':' +  ($scope.calcObj.recalcFromMinute || 0) + '?')
                    .ariaLabel('Re-calculate spec')
                    .ok('Submit')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    SpecActionsService.recalculateSarFromDate($scope.selectedSar,  moment($scope.calcObj.recalcFromDate).format('YYYY-MM-DD'),
                        $scope.calcObj.recalcFromHour || 0, $scope.calcObj.recalcFromMinute || 0);
                    showToast('Recalculation successfully started');
                });
            }
            }, 10);
        };

        $scope.calcSpecSerialClicked = () => {
            if ($scope.selectedSar &&  $scope.calcObj.recalcSnList) {
                let confirm = $mdDialog.confirm()
                    .title('Would you like to recalculate ' + $scope.selectedSar.name + ' ' + $scope.selectedSar.rev + ' for list of serials?')
                    .ariaLabel('Re-calculate spec')
                    .ok('Submit')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    SpecActionsService.recalculateSarSerial($scope.selectedSar, $scope.calcObj.recalcSnList);
                    showToast('Recalculation successfully started');
                });
            }
        };
        function initTab (field) {
            switch (field) {
                case 'specCalc':
                    $scope.autorun(() => {
                        if ($scope.getReactively('selectedSar')) {
                            $scope.recalcSnList = $scope.selectedSar.recalcSnList;
                            $scope.recalcFromDate = $scope.selectedSar.recalcFromDate;
                            $scope.recalcFromHour = $scope.selectedSar.recalcFromHour;
                            $scope.recalcFromMinute = $scope.selectedSar.recalcFromMinute;
                            $scope.recalcShowProgress = $scope.selectedSar.recalcForce;
                        }
                    });
                    break;
                case 'actionView':
                    $scope.autorun(() => {
                        Meteor.call('getActions', $scope.getReactively('selectedSar'), (err, data) => {
                            $scope.actions = data;
                        });
                    });
                    break;
                case 'specView':
                    $scope.autorun(() => {
                        Meteor.call('getSpecs', $scope.getReactively('selectedSar'), (err, data) => {
                            $scope.specs = data;
                        });
                    });
                    break;
                case 'log':
                    $scope.autorun(() => {
                        Meteor.call('getLogs', $scope.getReactively('selectedSar'), (err, data) => {
                            $scope.logs = data;
                        });
                    });
                    break;
                default:
                    break;
            }
        }

        function refreshConversions () {
            Meteor.call('getConversions', $scope.partNumber, (err, data) => {
                $scope.convbins.conversions = _.pluck(data, 'pnumLink');
                $scope.$apply();
            });
        }

        function refreshBins() {
            Meteor.call('getBins', $scope.partNumber, (err, data) => {
                $scope.convbins.bins = _.pluck(data, 'pnumLink');
                $scope.$apply();
            });
        }

        function showToast (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .content(msg)
                    .position('top left')
                    .hideDelay(3000));
        }
    }
])
;