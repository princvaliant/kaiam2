'use strict';

import './export-data.module';
import {Meteor} from 'meteor/meteor';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
import './export-data.controller';
import './export-data.tmpl.html';
/**
 * @ngdoc module
 * @name kaiamExportData
 * @description
 *
 * The `kaiamExportData`
 */
angular.module('kaiamExportData')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('exportdata');
            $stateProvider
                .state('triangular.exportdata', {
                    url: '/exportdata',
                    templateUrl: 'imports/ui/components/export-data/export-data.tmpl.html',
                    controller: 'ExportdataController'
                });
        }
    ])
    .run(['$rootScope', 'triMenu', '$meteor', function ($rootScope, triMenu, $meteor) {
        let user;
        $rootScope.$on('event:loginConfirmed', function () {
            initMenu();
        });
        $meteor.waitForUser().then(function () {
            initMenu();
        });

        function initMenu() {
            if (user) {
                return;
            }
            user = Meteor.users.findOne(Meteor.userId());
            if (user && !user.profile.isClient && _.contains(user.profile.roles, 'DASHBOARD_ACCESS')) {
                triMenu.addMenu({
                    type: 'link',
                    name: 'MENU.EXPORTDATA.EXPORTDATA',
                    state: 'triangular.exportdata',
                    icon: 'my_library_books',
                    priority: 6.6
                });
            }
        }
    }]);
