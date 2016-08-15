Syncstart = new Mongo.Collection('syncstart');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Syncstart.allow({
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
