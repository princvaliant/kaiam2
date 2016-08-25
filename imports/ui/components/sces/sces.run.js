'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import './sces.module';
import './sces.config';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';


/**
 * @ngdoc module
 * @name kaiamSces
 * @description Supply Chain Execution System
 */
angular.module('kaiamSces')
    .run(['$rootScope', 'triMenu', '$meteor', function ($rootScope, triMenu, $meteor) {
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
                triMenu.addMenu({
                    name: 'MENU.SCES.SCES',
                    icon: 'local_shipping',
                    type: 'link',
                    state: 'triangular.sces.tab.salesOrder',
                    priority: 5.1
                });
            }
        }
    }]);
