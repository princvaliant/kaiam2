Timetrendsunique = new Mongo.Collection('timetrendsunique');
Timetrendsw = new Mongo.Collection('timetrendsw');
Timetrendsd = new Mongo.Collection('timetrendsd');
Timetrendsh1 = new Mongo.Collection('timetrendsh1');
Timetrendsh8 = new Mongo.Collection('timetrendsh8');

Timetrendsunique.allow({
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
Timetrendsw.allow({
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
Timetrendsd.allow({
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
Timetrendsh8.allow({
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
Timetrendsh1.allow({
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
