Testlog = new Mongo.Collection('testlog');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Testlog.allow({
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
