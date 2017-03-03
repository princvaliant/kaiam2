'use strict';


Meteor.startup(function() {
    if (process.env.NODE_ENV !== 'development') {
    SyncedCron.start();
  }
});
