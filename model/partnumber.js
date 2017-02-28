PartNumbers = new Mongo.Collection('partnumbers');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
PartNumbers.allow({
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
