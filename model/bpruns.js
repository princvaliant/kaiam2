Bpruns = new Mongo.Collection('bprun');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Bpruns.allow({
  insert: function(userId, item) {
    return userId !== undefined;
  },
  update: function(userId, item, fields, modifier) {
    return userId !== undefined;
  },
  remove: function(userId, item) {
    return userId !== undefined;
  }
});
