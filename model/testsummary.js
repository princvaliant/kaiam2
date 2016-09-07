Testsummary = new Mongo.Collection('testsummary');
TestsummaryWeek = new Mongo.Collection('testsummaryweek');
/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Testsummary.allow({
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

TestsummaryWeek.allow({
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
