Package.describe({
  summary: 'MD data table library'
});

Package.on_use(function(api, where) {
  api.add_files('data-table.js', ['client']);
  api.add_files('data-table.css', ['client']);
});
