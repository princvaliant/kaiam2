Package.describe({
  summary: "Angular Print"
});

Package.on_use(function (api, where) {
  where = where || ['client'];

  api.use('underscore', where);

  api.add_files('angular-print.js', where);
  api.add_files('angular-print.css', where);
  api.add_files('json-formatter.css', where);
  api.add_files('json-formatter.js', where);
});
