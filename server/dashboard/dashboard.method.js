'use strict';
/**
 * SPCs method functions
 * @type {Meteor.publish}
 * @param {[string]} [testType] [Test type: txtests, rxtests etc.]
 * @param {[string]} [field] [Field to be retrieved:  OMA_in_dBm, Er_in_dB etc.]
 */


Meteor.methods({
    exportDashboard: function () {
        ScesDomains.getUser(this.userId);
        return Dashboards.aggregate([{
            $match: {
                'p': {$regex: '^XQX'}
            }
        }, {
            $project: {
                _id: 0,
                date: '$d',
                week: '$w',
                pnum: '$p',
                type: '$t',
                dok: '$dok',
                dtot: '$dtot',
                wok: '$wok',
                wtot: '$wtot'
            }
        }, {
            $sort: {
                date: -1,
                type: 1,
                pnum: 1
            }
        }]);
    }
});