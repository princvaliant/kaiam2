'use strict';
/**
 * @ngdoc module
 * @name kaiam.introduction
 * @description
 *
 * The `kaiam.introduction` module adds an introduction page
 */
angular.module('kaiamExportdata', [])
  .config(['$translatePartialLoaderProvider', '$stateProvider',
    function($translatePartialLoaderProvider, $stateProvider) {
      $translatePartialLoaderProvider.addPart('exportdata');
      $stateProvider
        .state('admin-panel.default.exportdata', {
          url: '/exportdata',
          templateUrl: 'client/modules/export-data/exportdata.tmpl.ng.html',
          controller: 'ExportdataController'
        });
    }
  ])
  .run(['$rootScope', 'SideMenu', '$meteor', function($rootScope, SideMenu, $meteor) {
    let user;
    $rootScope.$on('event:loginConfirmed', function() {
      initMenu();
    });
    $meteor.waitForUser().then(function() {
      initMenu();
    });

    function initMenu() {
      if (user) {
        return;
      }
      user = Meteor.users.findOne(Meteor.userId());
      if (user && !user.profile.isClient && _.contains(user.profile.roles, 'DASHBOARD_ACCESS')) {
        SideMenu.addMenu({
          type: 'link',
          name: 'MENU.EXPORTDATA.EXPORTDATA',
          state: 'admin-panel.default.exportdata',
          icon: 'icon-import-export',
          priority: 6.6
        });
      }
    }
  }]);
