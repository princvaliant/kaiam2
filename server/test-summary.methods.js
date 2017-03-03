'use strict';

Meteor.startup(function () {
    /**
     * Account Methods
     * @type {meteor.methods}
     */


    Meteor.methods({
        getTestSummaries: function (status) {
            let query = {
                timestamp: {
                    '$gte': new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 60))
                },
                status: {
                    '$in': ['P', 'F', 'E']
                }
            };
            if (status !== 'A') {
                query.status = status;
            }
            return Testsummary.find(query, {
                fields: {
                    sn: 1,
                    pnum: 1,
                    spec: 1,
                    d: 1,
                    w: 1,
                    cm: 1,
                    rack: 1,
                    dut: 1,
                    status: 1,
                    tsts: 1,
                    tstparams: 1
                }
            }).fetch();
        }
    });
});
