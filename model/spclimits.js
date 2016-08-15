Spclimits = new Mongo.Collection('spclimit');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Spclimits.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  }
});
