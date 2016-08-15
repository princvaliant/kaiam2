'use strict';
Meteor.methods({
  getCusttransCount: function (search, filter) {
    let user = ScesDomains.isLoggedIn(this.userId);
    let query = ScesDomains.constructQuery(this.userId, search, 'transceiver');
    return Domains.find(getOnlyForCompany(user, query)).count();
  }
});
Meteor.publish('custtrans', function (options, search) {
  let user = ScesDomains.isLoggedIn(this.userId);
  let query = ScesDomains.constructQuery(this.userId, search, 'transceiver');
  return Domains.find(getOnlyForCompany(user, query), options);
});
function getOnlyForCompany(user, query) {
  let salesOrders = Domains.find({
    type: 'salesOrder',
    'dc.Name (Sold-To)': user.profile.company
  }, {fields: {_id: 1}}).fetch();
  let ids = _.map(salesOrders, function (item) {
    return item._id;
  });
  query.$and.push({
    $or: [{parents: {$in: ids}}, {parents: user.profile.company}]
  });
  return query;
}