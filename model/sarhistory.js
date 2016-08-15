SarHistory = new Mongo.Collection('sarhistory');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
SarHistory.allow({
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
