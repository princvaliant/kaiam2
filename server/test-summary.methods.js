'use strict';

Meteor.startup(function() {
  /**
   * Account Methods
   * @type {meteor.methods}
   */
  Meteor.methods({
    getTestSummaries: function(status) {
      return Testsummary.find({status: status}, {
        fields: {
          sn: 1,
          pnum: 1,
          spec: 1,
          d: 1,
          w: 1,
          cm: 1,
          rack: 1,
          dut: 1,
          status: 1,
          tsts: 1,
          tstparams: 1
        }
      }).fetch();
    }
  });
});
