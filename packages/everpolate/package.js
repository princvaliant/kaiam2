Package.describe({
  summary: "Everpolate math library"
});

Package.on_use(function (api, where) {
  where = where || ['client', 'server'];

  api.use('underscore', where);

  api.add_files('regression.js', where);
});
