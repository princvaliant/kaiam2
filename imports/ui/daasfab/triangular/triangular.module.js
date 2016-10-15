import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';

import './router/router.module';
import './themes/themes.module';
import './themes/theming.provider';
import './themes/skins.provider';

import './components/components.module';
import './components/menu/menu.directive';
import './components/breadcrumbs/breadcrumbs.service';
import './components/footer/footer.controller';
import './components/loader/loader.directive';
import './components/widget/widget.directive';
import './components/widget/widget-chart.directive';

import './layouts/layouts.module';

import './directives/directives.module';

export default angular
    .module('triangular', [
        'triangular.router',
        ngMaterial,
        uiRouter,
        'triangular.layouts',
        'triangular.components',
        'triangular.themes',
        'triangular.directives'

    ]);
