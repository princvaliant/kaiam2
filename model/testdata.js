Testdata = new Mongo.Collection('testdata');

TestdataSpcs = new Mongo.Collection('testdataspcs');

TestdataExclude = new Mongo.Collection('testdataexclude');

TestdataPackout = new Mongo.Collection('testdatapackouts');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Testdata.allow({
  insert: function(userId, item) {
    return false;
  },
  update: function(userId, item, fields, modifier) {
    return false;
  },
  remove: function(userId, item) {
    return false;
  }
});

TestdataExclude.allow({
  insert: function(userId, item) {
    return true;
  },
  update: function(userId, item, fields, modifier) {
    return true;
  },
  remove: function(userId, item) {
    return false;
  }
});
