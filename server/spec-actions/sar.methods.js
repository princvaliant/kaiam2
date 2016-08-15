
Meteor.methods({
    removeSar: function (sarId) {
        check(sarId, String);
        SarActionParam.remove({sarId: sarId});
        SarSpecRange.remove({sarId: sarId});
        SarAction.remove({sarId: sarId});
        SarSpec.remove({sarId: sarId});
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
            fileName: sar.fileName,
            fileContent: sar.fileContent
        });
        let sarActions = SarAction.find({sarId: sar._id}).fetch();
        _.each(sarActions, (sa) => {
            _pasteSarAction(id, sa);
        });
        let sarSpecs = SarSpec.find({sarId: sar._id}).fetch();
        _.each(sarSpecs, (sa) => {
            _pasteSarSpec(id, sa);
        });
    },
    pasteSarAction: function (sar, sarAction) {
        _pasteSarAction(sar._id || sarAction.sarId,  sarAction);
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
    }
});

function  _pasteSarAction (sarId, sa) {
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

function  _pasteSarSpec (sarId, ss) {
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

