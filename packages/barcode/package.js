Package.describe({
  summary: 'Bar code print library'
});

Package.on_use(function (api, where) {
  api.add_files('CODE128.js', ['client']);
  api.add_files('jsbarcode.js', ['client']);

  api.export('JsBarcode');
});
