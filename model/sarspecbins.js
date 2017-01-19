SarSpecBin = new Mongo.Collection('sarspecbins');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
SarSpecBin.allow({
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
