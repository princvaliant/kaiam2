'use strict';
/**
 * Test Insertions publish functions
 */


Meteor.methods({
    testInsertions: function (device, groupType) {
        // Date and week range values
        ScesDomains.getUser(this.userId);
        let pnumregex = '^XQX';
        if (device === '100GB') {
            pnumregex = '^XQX4';
        } else if (device === '40GB') {
            pnumregex = '^XQX3|^XQX2';
        }
        if (groupType === 'rack') {
            return TestInsertionsRack.find({pnum: {$regex: pnumregex}}).fetch();
        } else {
            return TestInsertionsPnum.find({pnum: {$regex: pnumregex}}).fetch();
        }
    }
});
