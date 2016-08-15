'use strict';

Meteor.publish('workflows', function() {
  if (this.userId) {
    return Mes.find({}, {});
  }
});


