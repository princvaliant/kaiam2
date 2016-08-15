'use strict';
/**
 * Dashboard publish functions
 * @type {meteor.publish}
 */
Meteor.publish('dashboard', function() {
  ScesDomains.getUser(this.userId);
  return Dashboards.find({'id.p': {$regex:'^XQX'}});
});
