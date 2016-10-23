SarFlow = new Mongo.Collection('sarflows');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
SarFlow.allow({
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
