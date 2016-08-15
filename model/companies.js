Companies = new Mongo.Collection('companies');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Companies.allow({
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
