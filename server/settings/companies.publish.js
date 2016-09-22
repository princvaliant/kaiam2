
Meteor.publish('companies', function(options, search, filter) {
    return Companies.find();
});

