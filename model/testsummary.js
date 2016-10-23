Testsummary = new Mongo.Collection('testsummary');
TestsummaryWeek = new Mongo.Collection('testsummaryweek');

Testsummary2 = new Mongo.Collection('testsummary2');
TestsummaryWeek2 = new Mongo.Collection('testsummaryweek2');
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
