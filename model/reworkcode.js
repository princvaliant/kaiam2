ReworkCode = new Mongo.Collection('reworkcode');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
ReworkCode.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return false;
  }
});
