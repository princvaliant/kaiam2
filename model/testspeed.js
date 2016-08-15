TestSpeedV = new Mongo.Collection('vTestSpeed');
TestSpeed = new Mongo.Collection('testspeed');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
TestSpeedV.allow({
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

TestSpeed.allow({
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