ImageRequests = new Mongo.Collection('imageRequests');

ImageResponses = new Mongo.Collection('imageResponses');

/**
 * ImageRequests
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
ImageRequests.allow({
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

ImageResponses.allow({
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
