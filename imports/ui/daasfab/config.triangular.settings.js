import angular from 'angular';

angular
    .module('daasfab')
    .config(config);

config.$inject =  ['triSettingsProvider', 'triRouteProvider'];

/* @ngInject */
function config(triSettingsProvider, triRouteProvider) {
    var now = new Date();
    // set app name & logo (used in loader, sidemenu, footer, login pages, etc)
    triSettingsProvider.setName('');
    triSettingsProvider.setCopyright('&copy;' + now.getFullYear() + ' kaiamcorp.com');
    triSettingsProvider.setLogo('/assets/images/logo.png');
    // set current version of app (shown in footer)
    triSettingsProvider.setVersion('2.7.1');
    // set the document title that appears on the browser tab
    triRouteProvider.setTitle('Kaiam App');
    triRouteProvider.setSeparator('|');
}

