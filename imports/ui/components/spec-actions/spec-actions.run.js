'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './spec-actions.module';
import './spec-actions.config';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';

angular.module('kaiamSpecActions')
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
            if (user && !user.profile.isClient && _.intersection(user.profile.roles, ['ADMIN', 'MANAGER']).length > 0) {
                let menu = {
                    name: 'MENU.SPECACTIONS.SPECACTIONS',
                    icon: 'tune',
                    type: 'dropdown',
                    priority: 7.1,
                    children: []
                };
                menu.children.push({
                    name: 'MENU.SPECACTIONS.ACTION',
                    type: 'link',
                    icon: 'offline_pin',
                    state: 'triangular.specactions',
                    priority: 1.1,
                    params: {
                        class: 'ACTION'
                    }
                });
                menu.children.push({
                    name: 'MENU.SPECACTIONS.SPEC',
                    type: 'link',
                    icon: 'swap_vert',
                    state: 'triangular.specactions',
                    priority: 1.2,
                    params: {
                        class: 'SPEC'
                    }
                });
                menu.children.push({
                    name: 'MENU.SPECACTIONS.FILE',
                    type: 'link',
                    icon: 'attach_file',
                    state: 'triangular.specactions',
                    priority: 1.3,
                    params: {
                        class: 'FILE'
                    }
                });
                menu.children.push({
                    name: 'Flows',
                    type: 'link',
                    icon: 'format_list_numbered',
                    state: 'triangular.specactions',
                    priority: 1.4,
                    params: {
                        class: 'FLOW'
                    }
                });
                menu.children.push({
                    name: 'MENU.SPECACTIONS.OBSOLETE',
                    type: 'link',
                    icon: 'delete_sweep',
                    state: 'triangular.specactions',
                    priority: 1.4,
                    params: {
                        class: 'OBSOLETE'
                    }
                });
                triMenu.addMenu(menu);
            }
        }
    }]);
