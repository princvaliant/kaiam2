'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
import './eprom.module';
import './eprom-compare.controller';
import './eprom-compare.tmpl.html';

/**
 * @ngdoc module
 * @name kaiamEprom
 * @description
 *
 * The `kaiamEprom` module adds an eprom functionality
 */
angular.module('kaiamEprom')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('eprom');
            $stateProvider
                .state('triangular.eprom-compare', {
                    url: '/eprom-compare',
                    templateUrl: 'imports/ui/components/eprom/eprom-compare.tmpl.html',
                    controller: 'EpromCompareController'
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
            if (user && !user.profile.isClient && _.contains(user.profile.roles, 'ENGINEER')) {
                let menu = {
                    name: 'MENU.EPROM.EPROM',
                    icon: 'memory',
                    type: 'dropdown',
                    priority: 8.1,
                    children: []
                };
                menu.children.push({
                    name: 'MENU.EPROM.COMPARE',
                    type: 'link',
                    icon: 'compare_arrows',
                    state: 'triangular.eprom-compare',
                    priority: 1.1
                });
                triMenu.addMenu(menu);
            }
        }
    }]);
