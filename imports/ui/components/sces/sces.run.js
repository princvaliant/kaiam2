'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.module';
import './sces.config';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
import './sces.service';


/**
 * @ngdoc module
 * @name kaiamSces
 * @description Supply Chain Execution System
 */
angular.module('kaiamSces')
    .run(['$rootScope', 'triMenu', '$meteor', 'ScesService', function ($rootScope, triMenu, $meteor, ScesService) {
        let user;
        $rootScope.$on('event:loginConfirmed', function () {
            initMenu();
        });
        $meteor.waitForUser().then(function () {
            initMenu();
        });

        function initMenu () {
            if (user) {
                return;
            }
            user = Meteor.user();
            if (ScesSettings.isInternalMember(user, ScesSettings.internalRoles)) {
                let menu = {
                    name: 'MENU.SCES.SCES',
                    icon: 'subscriptions',
                    type: 'dropdown',
                    priority: 1.1,
                    children: []
                };
                let priority = 1;
                menu.children.push({
                    name: 'SCES.SCAN-FIND',
                    type: 'link',
                    icon: 'cast',
                    state: 'triangular.sces.scan',
                    priority: priority
                });
                _.each(_.keys(ScesSettings.columns), (domain) => {
                    priority += 1;
                    menu.children.push({
                        name: domain,
                        type: 'link',
                        icon: 'list',
                        state: 'triangular.sces.tab.' + domain.toLowerCase(),
                        priority: priority
                    });
                });
                triMenu.addMenu(menu);
            }
        }
    }]);
