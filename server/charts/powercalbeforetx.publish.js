Meteor.publish('powercalbeforetx', function(startDate, endDate) {
  ScesDomains.getUser(this.userId);
  let start = startDate || moment().subtract(30, 'days').toDate();
  let end = endDate || moment().toDate();
  let query = {
    'id.t': {
      $gte: moment(start).format('YYYY-MM-DD'),
      $lte: moment(end).format('YYYY-MM-DD')
    }
  };
  return Powercalbeforetx.find(query);
});
