import angular from 'angular';
import './layouts/footer/footer.controller';
import './layouts/leftsidenav/leftsidenav.controller';
import './layouts/loader/loader.controller';
import './layouts/rightsidenav/rightsidenav.controller';
import './layouts/toolbar/toolbar.controller';

import './layouts/loader/loader.tmpl.html';
import './layouts/leftsidenav/leftsidenav.tmpl.html';
import './layouts/rightsidenav/rightsidenav.tmpl.html';
import './layouts/toolbar/toolbar.tmpl.html';
import './layouts/footer/footer.tmpl.html';

angular
    .module('daasfab')
    .config(config);

config.$inject =  ['triLayoutProvider'];

/* @ngInject */
function config(triLayoutProvider) {
    // set app templates (all in app/layouts folder so you can tailor them to your needs)

    // loader screen HTML & controller
    triLayoutProvider.setDefaultOption('loaderTemplateUrl', 'imports/ui/daasfab/layouts/loader/loader.tmpl.html');
    triLayoutProvider.setDefaultOption('loaderController', 'LoaderController');

    // left sidemenu HTML and controller
    triLayoutProvider.setDefaultOption('sidebarLeftTemplateUrl', 'imports/ui/daasfab/layouts/leftsidenav/leftsidenav.tmpl.html');
    triLayoutProvider.setDefaultOption('sidebarLeftController', 'LeftSidenavController');

    // right sidemenu HTML and controller
    triLayoutProvider.setDefaultOption('sidebarRightTemplateUrl', 'imports/ui/daasfab/layouts/rightsidenav/rightsidenav.tmpl.html');
    triLayoutProvider.setDefaultOption('sidebarRightController', 'RightSidenavController');

    // top toolbar HTML and controller
    triLayoutProvider.setDefaultOption('toolbarTemplateUrl', 'imports/ui/daasfab/layouts/toolbar/toolbar.tmpl.html');
    triLayoutProvider.setDefaultOption('toolbarController', 'ToolbarController');

    // footer HTML
    triLayoutProvider.setDefaultOption('footerTemplateUrl', 'imports/ui/daasfab/layouts/footer/footer.tmpl.html');

    triLayoutProvider.setDefaultOption('toolbarSize', 'default');

    triLayoutProvider.setDefaultOption('toolbarShrink', true);

    triLayoutProvider.setDefaultOption('toolbarClass', '');

    triLayoutProvider.setDefaultOption('contentClass', '');

    triLayoutProvider.setDefaultOption('sideMenuSize', 'full');

    triLayoutProvider.setDefaultOption('showToolbar', true);

    triLayoutProvider.setDefaultOption('footer', true);
}

