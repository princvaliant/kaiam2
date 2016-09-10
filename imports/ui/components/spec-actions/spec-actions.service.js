'use strict';

angular.module('kaiamSpecActions')
    .service('SpecActionsService', ['$translate',  '$q',
        function ($translate, $q) {

            function updateSarExecution(sarId, sarActionId, operation, name, title) {
                let _execution = Sar.findOne(sarId).execution;
                if (operation === 'A') {
                    _execution.push({id: sarActionId, title: title || name, nodes: []});
                } else {
                    eachRecursive(_execution, sarActionId, name, title, operation);
                }
                Sar.update({_id: sarId}, {$set: {execution: _execution}});
            }

            function eachRecursive(list, sarActionId, name, title, operation) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === sarActionId) {
                        list[i].title = title || name;
                    }
                    eachRecursive(list[i].nodes, sarActionId, name, title, operation);
                }
            }

            let service = {
                addSar: function (pnum, active, lock, type, clss) {
                    Sar.insert({
                        pnum: pnum,
                        name: '',
                        rev: 1,
                        active: active,
                        lock: lock,
                        type: type,
                        class: clss,
                        execution: [],
                        created: moment().toDate()
                    });
                },
                removeSar: function (selection) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        if (s) {
                            Sar.remove(s._id);
                            Meteor.call('removeSar', s._id);
                        }
                    }
                },
                updateSar: function (sar) {
                    Sar.update({
                        _id: sar._id
                    }, {
                        $set: {
                            rev: sar.rev,
                            name: sar.name,
                            lock: sar.lock,
                            active: sar.active,
                            type: sar.type,
                            class: sar.class,
                            activated: sar.active === 'Y' ? moment().toDate() : null,
                            locked: sar.lock === 'Y' ? moment().toDate() : null
                        }
                    });
                },
                lockSar: function (selection) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        Sar.update({
                            _id: s._id
                        }, {
                            $set: {
                                lock: 'Y',
                                locked: moment().toDate()
                            }
                        });
                    }
                },
                recalculateSar: function (sar, snList, fromDate, toDate) {
                    if (sar) {
                        Sar.update({
                            _id: sar._id
                        }, {
                            $set: {
                                recalcSnList: snList,
                                recalcFromDate: fromDate,
                                recalcToDate: toDate,
                                recalcForce: true
                            }
                        });
                    }
                },
                addExecution(sarAction) {
                    if (sarAction) {
                        updateSarExecution(sarAction.sarId, sarAction._id, 'A', sarAction.name, sarAction.title);
                    }
                },
                readFileAsync: function (file) {
                    let deferred = $q.defer();
                    let fileReader = new FileReader();
                    fileReader.readAsText(file);
                    fileReader.onload = function (e) {
                        deferred.resolve(e.target.result);
                    };
                    return deferred.promise;
                },
                updateFile: function (sar, fileContent, fileName) {
                    Sar.update({
                        _id: sar._id
                    }, {
                        $set: {
                            fileContent: fileContent,
                            fileName: fileName
                        }
                    });
                },
                addSarAction: function (sar, name, title) {
                    if (sar) {
                        let count = SarAction.find({sarId: sar._id}).count();
                        let id = SarAction.insert({
                            sarId: sar._id,
                            name: name,
                            title: title,
                            group: '',
                            order: count + 1
                        });
                        updateSarExecution(sar._id, id, 'A', name, title);
                    }
                },
                removeSarAction: function (selection, execution) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        if (s) {
                            SarAction.remove(s._id);
                            Meteor.call('removeSarAction', s._id);
                            updateSarExecution(s.sarId, s._id, 'R', '', '');
                        }
                    }
                },
                updateSarAction: function (sarAction) {
                    SarAction.update({
                        _id: sarAction._id
                    }, {
                        $set: {
                            name: sarAction.name,
                            title: sarAction.title,
                            group: sarAction.group,
                            order: sarAction.order
                        }
                    });
                    updateSarExecution(sarAction.sarId, sarAction._id, 'U', sarAction.name, sarAction.title);
                },
                addSarActionParam: function (sar, sarAction, name, value) {
                    if (sar && sarAction) {
                        SarActionParam.insert({
                            sarId: sar._id,
                            sarActionId: sarAction._id,
                            name: name,
                            value: value
                        });
                    }
                },
                removeSarActionParam: function (selection) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        if (s) {
                            SarActionParam.remove(s._id);
                        }
                    }
                },
                updateSarActionParam: function (sarActionParam) {
                    SarActionParam.update({
                        _id: sarActionParam._id
                    }, {
                        $set: {
                            name: sarActionParam.name,
                            value: sarActionParam.value
                        }
                    });
                },

                addSarSpec: function (sar, type, subtype, order) {
                    if (sar) {
                        SarSpec.insert({
                            sarId: sar._id,
                            type: type,
                            subtype: subtype,
                            order: order
                        });
                    }
                },
                removeSarSpec: function (selection) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        if (s) {
                            SarSpec.remove(s._id);
                            Meteor.call('removeSarSpec', s._id);
                        }
                    }
                },
                updateSarSpec: function (sarSpec) {
                    SarSpec.update({
                        _id: sarSpec._id
                    }, {
                        $set: {
                            type: sarSpec.type,
                            subtype: sarSpec.subtype,
                            order: sarSpec.order !== '' ? parseInt(sarSpec.order) : ''
                        }
                    });
                },
                addSarSpecRange: function (sar, sarSpec, param, temperature, testMin, testMax) {
                    if (sar && sarSpec) {
                        SarSpecRange.insert({
                            sarId: sar._id,
                            sarSpecId: sarSpec._id,
                            param: param,
                            temperature: temperature,
                            testMin: testMin,
                            testMax: testMax
                        });
                    }
                },
                removeSarSpecRange: function (selection) {
                    if (selection) {
                        let s = selection.getSelectedRows()[0];
                        if (s) {
                            SarSpecRange.remove(s._id);
                        }
                    }
                },
                updateSarSpecRange: function (sarSpecRange) {
                    SarSpecRange.update({
                        _id: sarSpecRange._id
                    }, {
                        $set: {
                            param: sarSpecRange.param,
                            temperature: sarSpecRange.temperature !== '' ? parseInt(sarSpecRange.temperature) : '',
                            testMin: sarSpecRange.testMin !== '' ? parseFloat(sarSpecRange.testMin) : '',
                            testMax: sarSpecRange.testMax !== '' ? parseFloat(sarSpecRange.testMax) : ''
                        }
                    });
                },
                pasteSar: function (pnum, sar) {
                    Meteor.call('pasteSar', pnum, sar);
                },
                pasteSarAction: function (sar, sarAction) {
                    Meteor.call('pasteSarAction', sar, sarAction);
                },
                pasteSarSpec: function (sar, sarSpec) {
                    Meteor.call('pasteSarSpec', sar, sarSpec);
                }
            }
            return service;
        }
    ]);
