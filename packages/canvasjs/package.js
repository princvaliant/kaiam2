Package.describe({
  summary: "Canvas JS chart library"
});

Package.on_use(function (api, where) {
  where = where || ['client'];

  api.use('underscore', where);

  api.add_files('canvasjs.js', where);
});
