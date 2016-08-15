SarHelper = {
    // My auth will return the userId
    myAuth: function () {
        let userToken = this.query.token;
        if (userToken) {
            let user = Meteor.users.findOne({
                'services.email.verificationTokens.token': userToken
            });
            return user && user._id;
        }
    },

    getQuery: function (params) {
        let pnum = params.pnum;
        if (!pnum) {
            pnum = '';
        }
        let name = params.name;
        if (!name) {
            return 'ERROR: Parameter [name] is missing';
        }
        let rev = params.rev;
        if (rev) {
            return {pnum: pnum, name: name, rev: rev};
        } else {
            return {pnum: pnum, name: name, active: 'Y'};
        }
    },

    getActions: function (sarId) {
        let pipeline = [
            {
                $match: {_id: sarId}
            }, {
                $lookup: {
                    from: 'saractions',
                    localField: '_id',
                    foreignField: 'sarId',
                    as: 'actions'
                }
            }, {
                $unwind: '$actions'
            }, {
                $sort: {
                    'actions.order': 1
                }
            }, {
                $project: {
                    pnum: '$pnum',
                    name: '$name',
                    revision: '$rev',
                    revtype: '$type',
                    action: '$actions.name',
                    actionOrder: '$actions.order',
                    actionGroup: '$actions.group',
                    actionId: '$actions._id'
                }
            }, {
                $lookup: {
                    from: 'saractionparams',
                    localField: 'actionId',
                    foreignField: 'sarActionId',
                    as: 'actionparams'
                }
            }, {
                $unwind: {
                    path: '$actionparams',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $sort: {
                    actionOrder: 1
                }
            }, {
                $group: {
                    _id: {
                        action: '$actionId'
                    },
                    action: {$last: '$action'},
                    pnum: {$last: '$pnum'},
                    actionOrder: {$last: '$actionOrder'},
                    actionGroup: {$last: '$actionGroup'},
                    name: {$last: '$name'},
                    revision: {$last: '$revision'},
                    revtype: {$last: '$revtype'},
                    params: {
                        $push: {
                            name: '$actionparams.name',
                            value: '$actionparams.value'
                        }
                    }
                }
            }, {
                $sort: {
                    actionOrder: 1
                }
            }, {
                $group: {
                    _id: {
                        pnum: '$pnum',
                        name: '$name',
                        revision: '$revision',
                        revtype: '$revtype'
                    },
                    params: {
                        $push: {
                            action: '$action',
                            group: '$actionGroup',
                            params: '$params'
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    pnum: '$_id.pnum',
                    name: '$_id.name',
                    revision: '$_id.revision',
                    revtype: '$_id.revtype',
                    actions: '$params'

                }
            }
        ];
        let obj = {};
        let ret = Sar.aggregate(pipeline);
        if (ret && ret.length > 0) {
            obj.pnum = ret[0].pnum;
            obj.name = ret[0].name;
            obj.revision = ret[0].revision;
            obj.revtype = ret[0].revtype;
            obj.actions = [];
            _.each(ret[0].actions, (row) => {
                let obj2 = {};
                let params = {};
                _.each(row.params, (row2) => {
                    if (!_.isEmpty(row2)) {
                        let val = row2.value;
                        if (val === 0) {

                        } else if (val.indexOf('"') >= 0) {
                            val = val.replace(/"/g, '');
                        } else if (!isNaN(val)) {
                            val = Number(val);
                        }
                        params[row2.name] = val;
                    }
                });
                params.actionGroup = row.group || '';
                obj2['Actions.' + row.action] = params;
                obj.actions.push(obj2);
            });
        }
        return obj;
    }
    ,

    getSpecs: function (sarId) {
        let pipeline = [
            {
                $match: {_id: sarId}
            }, {
                $lookup: {
                    from: 'sarspecs',
                    localField: '_id',
                    foreignField: 'sarId',
                    as: 'specs'
                }
            }, {
                $unwind: '$specs'
            }, {
                $project: {
                    pnum: '$pnum',
                    name: '$name',
                    revision: '$rev',
                    revtype: '$type',
                    type: '$specs.type',
                    subtype: '$specs.subtype',
                    specId: '$specs._id'
                }
            }, {
                $lookup: {
                    from: 'sarspecranges',
                    localField: 'specId',
                    foreignField: 'sarSpecId',
                    as: 'specranges'
                }
            }, {
                $unwind: '$specranges'
            }, {
                $match: {
                    'specranges.param': {
                        $ne: ''
                    }
                }
            }, {
                $group: {
                    _id: {
                        type: '$type',
                        subtype: '$subtype',
                        temperature: '$specranges.temperature'
                    },
                    pnum: {$last: '$pnum'},
                    name: {$last: '$name'},
                    revision: {$last: '$revision'},
                    revtype: {$last: '$revtype'},
                    ranges: {
                        $push: {
                            name: '$specranges.param',
                            min: '$specranges.testMin',
                            max: '$specranges.testMax'
                        }
                    }
                }
            }, {
                $group: {
                    _id: {
                        pnum: '$pnum',
                        name: '$name',
                        revision: '$revision',
                        revtype: '$revtype'
                    },
                    specs: {
                        $push: {
                            type: '$_id.type',
                            subtype: '$_id.subtype',
                            temperature: '$_id.temperature',
                            ranges: '$ranges'
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    specs: '$specs',
                    pnum: '$_id.pnum',
                    name: '$_id.name',
                    revision: '$_id.revision',
                    revtype: '$_id.revtype'

                }
            }
        ];
        return Sar.aggregate(pipeline)[0];
    }
}
;
