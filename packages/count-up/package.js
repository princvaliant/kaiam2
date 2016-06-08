Package.describe({
  summary: "Count up library"
});

Package.on_use(function (api, where) {
  where = where || ['client'];

  api.use('underscore', where);

  api.add_files('count-up.js', where);
});
