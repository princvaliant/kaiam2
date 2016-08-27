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
    .run(['$rootScope', 'triMenu', '$meteor', 'ScesService',  function ($rootScope, triMenu, $meteor, ScesService) {
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
            if (user && !user.profile.isClient && _.intersection(user.profile.roles, ['ORDER_MANAGEMENT', 'INVENTORY_MANAGEMENT']).length > 0) {
                let menu = {
                    name: 'MENU.SCES.SCES',
                    icon: 'local_shipping',
                    type: 'dropdown',
                    priority: 5.1,
                    children: []
                };
                _.each(_.keys(ScesSettings.columns), (domain) => {
                    menu.children.push({
                        name: domain,
                        type: 'link',
                        state: 'triangular.sces.tab.' + domain.toLowerCase(),
                        priority: 1.15
                    });
                });
                triMenu.addMenu(menu);
            }
        }
    }]);
