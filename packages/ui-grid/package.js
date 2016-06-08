Package.describe({
  summary: 'ui-grid library'
});

Package.on_use(function(api, where) {
  api.addFiles('ui-grid.js', ['client']);
  api.addFiles('ui-grid.css', ['client']);
  api.addFiles('custom.css', ['client']);
  api.addFiles('csv.js', ['client']);
  api.addAssets('ui-grid.eot', ['client']);
  api.addAssets('ui-grid.ttf', ['client']);
  api.addAssets('ui-grid.woff', ['client']);
  api.addAssets('ui-grid.svg', ['client']);

  api.export('CSV', ['client']);
});
