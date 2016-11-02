import {check} from 'meteor/check';


Meteor.methods({
    removeSar: function (sarId) {
        check(sarId, String);
        SarActionParam.remove({sarId: sarId});
        SarSpecRange.remove({sarId: sarId});
        SarAction.remove({sarId: sarId});
        SarSpec.remove({sarId: sarId});
        SarFlow.remove({sarId: sarId});
    },
    removeSarAction: function (sarActionId) {
        check(sarActionId, String);
        SarActionParam.remove({sarActionId: sarActionId});
    },
    removeSarSpec: function (sarSpecId) {
        check(sarSpecId, String);
        SarSpecRange.remove({sarSpecId: sarSpecId});
    },
    pasteSar: function (pnum, sar) {
        let id = Sar.insert({
            name: '',
            pnum: pnum || sar.pnum,
            active: 'N',
            lock: 'N',
            type: sar.type,
            class: sar.class,
            fileName: sar.fileName,
            fileContent: sar.fileContent,
            created: moment().toDate()
        });
        let sarActions = SarAction.find({sarId: sar._id}).fetch();
        _.each(sarActions, (sa) => {
            _pasteSarAction(id, sa);
        });
        let sarSpecs = SarSpec.find({sarId: sar._id}).fetch();
        _.each(sarSpecs, (sa) => {
            _pasteSarSpec(id, sa);
        });
        let sarFlows = SarFlow.find({sarId: sar._id}).fetch();
        _.each(sarFlows, (sa) => {
            _pasteSarFlow(id, sa);
        });
    },
    pasteSarAction: function (sar, sarAction) {
        _pasteSarAction(sar._id || sarAction.sarId, sarAction);
    },
    pasteSarSpec: function (sar, sarSpec) {
        _pasteSarSpec(sar._id || sarSpec);
    },
    getActions: function (sar) {
        return SarHelper.getActions(sar._id);
    },
    getSpecs: function (sar) {
        return SarHelper.getSpecs(sar._id);
    },
    getLogs: function (sar) {
        if (!sar) {
            return [];
        }
        let pipeline = [
            {
                $match: {
                    _id: sar._id
                }
            }
        ];
        return Sar.aggregate(pipeline);
    },
    exportActions: function (id) {
        return Sar.aggregate([{
            $match: {
                _id: id
            }
        }, {
            $lookup: {
                from: 'saractions',
                localField: '_id',
                foreignField: 'sarId',
                as: 'sa'
            }
        }, {
            $unwind: {
                'path': '$sa',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            $sort: {
                'sa.order': 1
            }
        }, {
            $lookup: {
                from: 'saractionparams',
                localField: 'sa._id',
                foreignField: 'sarActionId',
                as: 'sap'
            }
        }, {
            $unwind: {
                'path': '$sap',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            $project: {
                name: '$name',
                rev: '$rev',
                pnum: '$pnum',
                active: '$active',
                lock: '$lock',
                action: '$sa.name',
                group: '$sa.group',
                order: '$sa.order',
                parameter: {$ifNull: ['$sap.name', '']},
                value: {$ifNull: ['$sap.value', '']}
            }
        }, {
            $sort: {
                'order': 1
            }
        }
        ]);
    },
    exportSpecs: function (id) {
        return Sar.aggregate([{
            $match: {
                _id: id
            }
        }, {
            $lookup: {
                from: 'sarspecs',
                localField: '_id',
                foreignField: 'sarId',
                as: 'ss'
            }
        }, {
            $unwind: {
                'path': '$ss',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            $sort: {
                'ss.order': 1
            }
        }, {
            $lookup: {
                from: 'sarspecranges',
                localField: 'ss._id',
                foreignField: 'sarSpecId',
                as: 'ssr'
            }
        }, {
            $unwind: {
                'path': '$ssr',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            $project: {
                name: '$name',
                rev: '$rev',
                pnum: '$pnum',
                active: '$active',
                lock: '$lock',
                type: '$ss.type',
                subtype: '$ss.subtype',
                order: '$ss.order',
                parameter: {$ifNull: ['$ssr.param', '']},
                temperature: {$ifNull: ['$ssr.temperature', '']},
                min: {$ifNull: ['$ssr.testMin', '']},
                max: {$ifNull: ['$ssr.testMax', '']}
            }
        }, {
            $sort: {
                'order': 1
            }
        }
        ]);
    },

    exportFile: function (id) {
        return Sar.aggregate([{
            $match: {
                _id: id
            }
        }]);
    }
});

function _pasteSarAction (sarId, sa) {
    let id = SarAction.insert({
        sarId: sarId,
        name: sa.name,
        order: sa.order,
        group: sa.group
    });
    let sarActionParams = SarActionParam.find({sarActionId: sa._id}).fetch();
    _.each(sarActionParams, (sap) => {
        SarActionParam.insert({
            sarId: sarId,
            sarActionId: id,
            name: sap.name,
            value: sap.value
        });
    });
}

function _pasteSarSpec (sarId, ss) {
    let id = SarSpec.insert({
        sarId: sarId,
        type: ss.type,
        subtype: ss.subtype,
        order: ss.order
    });
    let sarSpecRanges = SarSpecRange.find({sarSpecId: ss._id}).fetch();
    _.each(sarSpecRanges, (sas) => {
        SarSpecRange.insert({
            sarId: sarId,
            sarSpecId: id,
            param: sas.param,
            temperature: sas.temperature,
            testMin: sas.testMin,
            testMax: sas.testMax
        });
    });
}

function _pasteSarFlow (sarId, ss) {
    SarFlow.insert({
        sarId: sarId,
        type: ss.type,
        subtype: ss.subtype,
        order: ss.order,
        required: ss.required,
        ignoreSeq: ss.ignoreSeq
    });
}

