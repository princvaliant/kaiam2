SarAction = new Mongo.Collection('saractions');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
SarAction.allow({
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
