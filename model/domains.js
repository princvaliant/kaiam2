class Domain {
  constructor(doc) {
    _.extend(this, doc);
  }
  canEdit() {
    return this.getRole('e');
  }
  canMove() {
    return this.getRole('m');
  }

  // Get role query for view based on logged in user
  getRole(action) {
    let user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('USER-NOT-LOGGED');
    }
    let domain = _.where(ScesSettings.domains, {
      type: this.type
    })[0];
    if (!domain) {
      throw new Meteor.Error('SCES.INVALID-DOMAIN-TYPE');
    }
    let a = domain[this.state.id].roles[action];
    // If user is member of action role return True
    if (_.intersection(user.profile.roles, a).length === 0) {
      return false;
    }
    return true;
  }
}

Domains = new Mongo.Collection('domains', {
  transform: function(doc) {
    return new Domain(doc);
  }
});

DomainEvents = new Mongo.Collection('domainevents');
DomainFiles = new Mongo.Collection('domainfiles');
DomainCounts = new Mongo.Collection('domaincounts');

/**
 * Security Restriction
 * todo: refactor
 * @type {Mongo.Collection.allow}
 */
Domains.allow({
  insert: function(userId) {
    return userId !== undefined;
  },
  update: function(userId) {
    return userId !== undefined;
  },
  remove: function(userId) {
    return userId !== undefined;
  }
});

DomainEvents.allow({
  insert: function(userId) {
    return userId !== undefined;
  },
  update: function(userId) {
    return userId !== undefined;
  },
  remove: function(userId) {
    return userId !== undefined;
  }
});

DomainFiles.allow({
  insert: function(userId) {
    return userId !== undefined;
  },
  update: function(userId) {
    return userId !== undefined;
  },
  remove: function(userId) {
    return userId !== undefined;
  }
});
