'use strict';

angular.module('kaiamSpecActions')
    .service('SpecActionsInitService', ['$translate', '$meteor', '$timeout', '$mdDialog', 'SpecActionsService',
        function ($translate, $meteor, $timeout, $mdDialog, SpecActionsService) {

            let service = {
                initSars: function (scope) {
                    scope.canEdit = function () {
                        if (!scope.selectedSarLock) {
                            return false;
                        }
                        return scope.selectedSarLock !== 'Y';
                    }
                    let coldef = [{
                        field: 'name',
                        headerName: 'Name',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '25%'
                    }, {
                        field: 'rev',
                        headerName: 'Rev.',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '12%'
                    }, {
                        headerName: 'Active',
                        field: 'active',
                        name: 'active',
                        enableFiltering: true,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'active',
                        cellEditableCondition: true,
                        editDropdownOptionsArray: [
                            {id: 'Y', active: 'Y'},
                            {id: 'N', active: 'N'}
                        ],
                        width: '12%'
                    }, {
                        headerName: 'Locked',
                        field: 'lock',
                        name: 'lock',
                        enableFiltering: true,
                        type: 'boolean',
                        cellEditableCondition: false,
                        cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="row.entity.lock == \'Y\'"><md-icon md-font-icon="zmdi zmdi-lock"></md-icon></span></div>',
                        width: '12%'
                    }, {
                        headerName: 'Type',
                        field: 'type',
                        enableFiltering: true,
                        width: '15%',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'id',
                        cellEditableCondition: scope.canEdit,
                        editDropdownOptionsArray: [
                            {id: 'PROD'},
                            {id: 'ENG'}
                        ]
                    }, {
                        headerName: 'Class',
                        field: 'class',
                        enableFiltering: true,
                        width: '12%',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'id',
                        cellEditableCondition: true,
                        editDropdownOptionsArray: [
                            {id: 'ACTION'},
                            {id: 'SPEC'},
                            {id: 'FILE'},
                            {id: 'OBSOLETE'}
                        ]
                    }];
                    scope.gridSars = {
                        enableGridMenu: false,
                        enableSorting: true,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: true,
                        enableCellEditOnFocus: true,
                        columnDefs: coldef,
                        onRegisterApi: function (gridApi) {
                            scope.sarApi = gridApi;
                            gridApi.edit.on.beginCellEdit(scope, function (row) {
                                gridApi.selection.selectRow(row);
                            });
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSar(row);
                            });
                            gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                                if (row && row.entity) {
                                    scope.selectedSarLock = row.entity.lock;
                                    scope.selectedFileContent = row.entity.fileContent;
                                    scope.selectedFileName = row.entity.fileName;
                                    scope.selectedSar = row.entity;
                                    scope.cacheSar = _.clone(row.entity);
                                    scope.selectedExecution = angular.copy(row.entity.execution) || [];
                                    if (scope.sarActionApi) {
                                        scope.sarActionApi.dragndrop.setDragDisabled(!scope.canEdit());
                                    }
                                }
                            });
                        }
                    };
                },
                initSarActions: function (scope) {
                    let coldef = [{
                        field: 'name',
                        headerName: 'Name',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '70%'
                    }, {
                        field: 'group',
                        headerName: 'Group',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '20%'
                    }];
                    scope.gridSarActions = {
                        enableGridMenu: false,
                        enableSorting: false,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: true,
                        enableCellEditOnFocus: true,
                        columnDefs: coldef,
                        rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true">' +
                        '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                        'class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ' +
                        'ui-grid-cell></div></div>',
                        onRegisterApi: function (gridApi) {
                            scope.sarActionApi = gridApi;
                            gridApi.edit.on.beginCellEdit(scope, function (row) {
                                gridApi.selection.selectRow(row);
                            });
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSarAction(row);
                            });
                            gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                                scope.selectedSarAction = row.entity;
                            });
                            gridApi.draggableRows.on.rowDropped(scope, function (info, dropTarget) {
                                let i = 10;
                                if (scope.canEdit()) {
                                    gridApi.grid.rows.forEach(function (row) {
                                        row.entity.order = i;
                                        SpecActionsService.updateSarAction(row.entity);
                                        i += 10;
                                    });
                                }
                            });
                        }
                    };
                },
                initSarActionParams: function (scope) {
                    let coldef = [{
                        field: 'name',
                        headerName: 'Name',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '60%'
                    }, {
                        field: 'value',
                        headerName: 'value',
                        enableFiltering: false,
                        cellEditableCondition: scope.canEdit,
                        width: '35%'
                    }];
                    scope.gridSarActionParams = {
                        enableGridMenu: false,
                        enableSorting: true,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: false,
                        enableCellEditOnFocus: true,
                        enableSelectAll: true,
                        columnDefs: coldef,
                        onRegisterApi: function (gridApi) {
                            scope.sarActionParamApi = gridApi;
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSarActionParam(row);
                            });
                        }
                    };
                },
                initSarSpecs: function (scope) {
                    let coldef = [{
                        field: 'type',
                        headerName: 'Test type',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '37%'
                    }, {
                        field: 'subtype',
                        headerName: 'Test sub type',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '37%'
                    }, {
                        field: 'order',
                        headerName: 'Order',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '16%'
                    }];
                    scope.gridSarSpecs = {
                        enableGridMenu: false,
                        enableSorting: true,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: true,
                        enableCellEditOnFocus: true,
                        columnDefs: coldef,
                        onRegisterApi: function (gridApi) {
                            scope.sarSpecApi = gridApi;
                            gridApi.edit.on.beginCellEdit(scope, function (row) {
                                gridApi.selection.selectRow(row);
                            });
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSarSpec(row);
                            });
                            gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                                scope.selectedSarSpec = row.entity;
                            });
                        }
                    };
                },
                initSarSpecRanges: function (scope) {
                    let coldef = [{
                        field: 'param',
                        headerName: 'Parameter',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit
                    }, {
                        field: 'temperature',
                        headerName: 'Temperature',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit
                    }, {
                        field: 'testMin',
                        headerName: 'Test min',
                        enableFiltering: false,
                        cellEditableCondition: scope.canEdit
                    }, {
                        field: 'testMax',
                        headerName: 'Test max',
                        enableFiltering: false,
                        cellEditableCondition: scope.canEdit
                    }];
                    scope.gridSarSpecRanges = {
                        enableGridMenu: false,
                        enableSorting: true,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: true,
                        enableCellEditOnFocus: true,
                        columnDefs: coldef,
                        onRegisterApi: function (gridApi) {
                            scope.sarSpecRangeApi = gridApi;
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSarSpecRange(row);
                            });
                            gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                                scope.selectedSarSpecRange = row.entity;
                            });
                        }
                    };
                },
                initSarFlows: function (scope) {
                    let coldef = [{
                        field: 'type',
                        headerName: 'Test type',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '25%'
                    }, {
                        field: 'subtype',
                        headerName: 'Test sub type',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '25%'
                    }, {
                        field: 'order',
                        headerName: 'Order',
                        enableFiltering: true,
                        cellEditableCondition: scope.canEdit,
                        width: '12%'
                    }, {
                        headerName: 'Required',
                        field: 'required',
                        name: 'required',
                        enableFiltering: true,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'active',
                        cellEditableCondition: true,
                        editDropdownOptionsArray: [
                            {id: 'Y', active: 'Y'},
                            {id: 'N', active: 'N'}
                        ],
                        width: '12%'
                    }, {
                        headerName: 'Ignore sequence',
                        field: 'ignoreSeq',
                        name: 'ignoreSeq',
                        enableFiltering: true,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'active',
                        cellEditableCondition: true,
                        editDropdownOptionsArray: [
                            {id: 'Y', active: 'Y'},
                            {id: '', active: ''}
                        ],
                        width: '12%'
                    }];
                    scope.gridSarFlows = {
                        enableGridMenu: false,
                        enableSorting: true,
                        noUnselect: true,
                        multiSelect: false,
                        enableFiltering: true,
                        minRowsToShow: 15,
                        enableRowSelection: true,
                        enableCellEditOnFocus: true,
                        columnDefs: coldef,
                        onRegisterApi: function (gridApi) {
                            scope.sarFlowApi = gridApi;
                            gridApi.edit.on.beginCellEdit(scope, function (row) {
                                gridApi.selection.selectRow(row);
                            });
                            gridApi.edit.on.afterCellEdit(scope, function (row) {
                                SpecActionsService.updateSarFlow(row);
                            });
                            gridApi.selection.on.rowSelectionChanged(scope, function (row) {
                                scope.selectedSarFlow = row.entity;
                            });
                        }
                    };
                }
            };
            return service;
        }
    ]);
