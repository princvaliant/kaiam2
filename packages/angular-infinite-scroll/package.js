Package.describe({
  summary: "Angular Infinite scroll"
});

Package.on_use(function (api, where) {
  where = where || ['client'];

  api.use('underscore', where);

  api.add_files('angular-infinite-scroll.js', where);
});
