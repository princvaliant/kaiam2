SarSpec = new Mongo.Collection('sarspecs');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
SarSpec.allow({
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
