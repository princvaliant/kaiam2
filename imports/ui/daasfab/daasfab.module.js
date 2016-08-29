import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import ngMessages from 'angular-messages';
import ngCookies from 'angular-cookies';
import ngSanitize from 'angular-sanitize';
import ngMaterial from 'angular-material';
import ngMdIcons from 'angular-material-icons';
import LocalStorageModule from 'angular-local-storage';
import angularMoment from 'angular-moment';
import hljs from 'angular-highlightjs';
import ngFileUpload from 'ng-file-upload';
import 'angular-mocks/angular-mocks';
import 'angular-translate';

import './triangular/translate/translate.module';
import './triangular/translate/translate.config';

import './triangular/triangular.module';
import './triangular/triangular.config';
import './triangular/triangular.run';

import './triangular/settings.provider';

import './triangular/router/router.provider';
import './triangular/router/router.run';

import './triangular/layouts/layouts.provider';
import './permission/permission.module';

// Application modules
import '../components/authentication/authentication.run';
import '../components/dashboard/dashboard.run';
import '../components/settings/settings.config';
import '../components/spec-actions/spec-actions.run';
// import '../components/charts/charts.run';
// import '../components/export-data/export-data.config';
// import '../components/transceiver-view/transceiver-view.config';
import '../components/sces/sces.run';

const name = 'daasfab';

export default angular.module(name, [
    angularMeteor,
    uiRouter,
    ngAnimate,
    ngAria,
    ngMessages,
    ngCookies,
    ngSanitize,
    ngMaterial,
    ngMdIcons,
    LocalStorageModule,
    angularMoment,
    hljs,
    ngFileUpload,

    'AngularPrint',
    'infinite-scroll',
    'ui.tree',

    'ui.grid',
    'ui.grid.edit',
    'ui.grid.autoResize',
    'ui.grid.saveState',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns',
    'ui.grid.selection',
    'ui.grid.importer',
    'ui.grid.cellNav',

    'triangular',
    'app.translate',
    'app.permission',

    // Kaiam modules
    'kaiamAuthentication',
    'kaiamDashboard',
    'kaiamSettings',
    'kaiamSpecActions',
   // 'kaiamCharts',
   // 'kaiamExportData',
   // 'kaiamTransceiverView',
    'kaiamSces'
]);
angular.module(name)
    .constant('API_CONFIG', {
        'url': 'http://daasfab/'
    });


