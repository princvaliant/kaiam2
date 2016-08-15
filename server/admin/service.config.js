'use strict';
/**
 *  OAuth Service Configs
 *  @type {meteor.startup}
 */

Accounts.validateLoginAttempt((attempt) => {
  if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified) {
    throw new Meteor.Error(100002, 'Email not verified');
  }
  return true;
});

Meteor.startup(() => {
  let smtp = {
    username: 'opssupport@kaiam.com',
    password: '6analytic7',
    server: 'smtp.gmail.com',
    port: 465
  };
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' +
    encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

  // Add indexes to optimize performance
  Testdata._ensureIndex({
    'device.PartNumber': 1,
    timestamp: 1
  });
  Testdata._ensureIndex({
    type: 1,
    subtype: 1,
    status: 1,
    timestamp: 1,
    'device.PartNumber': 1,
    'meta.StartDateTime': 1
  });
  Testdata._ensureIndex({
    'device.SerialNumber': 1
  });

  //Kadira.connect('bBDjsGctHhJhCMbQ5', '03f31aae-37b3-4498-a4cb-dfd96c7c2c16');

  //var createServiceConfiguration = function (service:string, clientId:string, secret:string) {
  //  // reset config on startup
  //  ServiceConfiguration.configurations.remove({
  //    service: service
  //  });
  //  var config = {
  //    generic: {
  //      service: service,
  //      clientId: clientId,
  //      secret: secret
  //    },
  //    facebook: {
  //      service: service,
  //      appId: clientId,
  //      secret: secret
  //    },
  //    google: {
  //      service: service,
  //      appId: clientId,
  //      secret: secret
  //    },
  //    github: {
  //      service: service,
  //      appId: clientId,
  //      secret: secret
  //    },
  //    twitter: {
  //      service: service,
  //      consumerKey: clientId,
  //      secret: secret
  //    },
  //    kickbox: {
  //      service: service,
  //      consumerKey: clientId
  //    }
  //  };
  //  serviceConfig(service);
  //  function serviceConfig(service:string) {
  //    var services:string[] = ['facebook', 'google', 'twitter', 'github', 'kickbox'];
  //    if (_.contains(services, service)) {
  //      return ServiceConfiguration.configurations.insert(config[service]);
  //    } else {
  //      return ServiceConfiguration.configurations.insert(config.generic);
  //    }
  //  }
  //};
  //
  //
  ///**
  // * Configs: Add Key, Secret & set to true to activate
  // * {service, key, secret, activated}
  // */
  //createServiceConfiguration('facebook', 'Insert your appId here.', 'Insert your secret here.');
  //createServiceConfiguration('github', 'Insert your clientId here.', 'Insert your secret here.');
  //createServiceConfiguration('google', 'Insert your clientId here.', 'Insert your secret here.');
  //createServiceConfiguration('twitter', 'Insert your consumerKey here.', 'Insert your secret here.');
  //
  ////if (Settings.verifyEmail) {
  ////  createServiceConfiguration('kickbox', 'Insert API key', null);
  ////}
});

Meteor.methods({
  getEnvironment: function() {
    return process.env.NODE_ENV;
  }
});
