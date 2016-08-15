'use strict';

Meteor.publish('sars', function() {
  if (this.userId) {
    return Sar.find({}, {});
  }
});

Meteor.publish('sar-actions', function() {
  if (this.userId ) {
    return SarAction.find({}, {});
  }
});

Meteor.publish('sar-action-params', function() {
  if (this.userId) {
    return SarActionParam.find({}, {});
  }
});

Meteor.publish('sar-specs', function() {
  if (this.userId ) {
    return SarSpec.find({}, {});
  }
});

Meteor.publish('sar-spec-ranges', function() {
  if (this.userId) {
    return SarSpecRange.find({}, {});
  }
});


