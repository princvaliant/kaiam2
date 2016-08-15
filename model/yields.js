YieldDaily = new Mongo.Collection('yielddaily');
YieldWeekly = new Mongo.Collection('yieldweekly');
YieldRework = new Mongo.Collection('yieldrework');

YieldDailyBr = new Mongo.Collection('yielddailybr');
YieldWeeklyBr = new Mongo.Collection('yieldweeklybr');
YieldReworkBr = new Mongo.Collection('yieldreworkbr');

Yields = new Mongo.Collection('yields');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
YieldDaily.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

YieldWeekly.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

YieldRework.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

YieldReworkBr.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

YieldDailyBr.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

YieldWeeklyBr.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

