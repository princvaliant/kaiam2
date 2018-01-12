'use strict';
/**
 * Dashboard publish functions
 * @type {meteor.publish}
 */
Meteor.publish('dashboard', function () {
    ScesDomains.getUser(this.userId);
    let date = moment().format('YYYY');
    let w = parseInt(moment().format('W'));
    return Dashboards.find({'p': {$regex: '^XQX'}, 'd': {$regex: '^' + date}, w: w});
});
