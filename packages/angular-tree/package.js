Package.describe({
  summary: "Angular tree"
});

Package.on_use(function (api, where) {
  where = where || ['client'];

  api.use('underscore', where);

  api.add_files('angular-tree.js', where);
  api.add_files('angular-tree.css', where);
});
