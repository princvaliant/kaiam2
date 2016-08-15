LossesUnique = new Mongo.Collection('lossunique');
LossesGroup = new Mongo.Collection('lossgroup');
LossesPerRack = new Mongo.Collection('lossperrack');
LossExportsUnique = new Mongo.Collection('lossexportunique');
LossExportsGroup = new Mongo.Collection('lossexportgroup');
/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
LossesUnique.allow({
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

LossesGroup.allow({
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

LossesPerRack.allow({
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

LossExportsUnique.allow({
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

LossExportsGroup.allow({
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

