'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
import './transceiver-view.module';
import './transceiver-view.controller';
import './transceiver-view.tmpl.html';

/**
 * @ngdoc module
 * @name kaiam.introduction
 * @description
 *
 * The `kaiam.introduction` module adds an introduction page
 */
angular.module('kaiamTransceiverView')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('transceiver');
            $stateProvider
                .state('triangular.transceiverview', {
                    url: '/transceiverview',
                    templateUrl: 'imports/ui/components/transceiver-view/transceiver-view.tmpl.html',
                    controller: 'TransceiverViewController'
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
                    name: 'MENU.TRANSCEIVERVIEW.TRANSCEIVERVIEW',
                    state: 'triangular.transceiverview',
                    icon: 'perm_device_information',
                    priority: 6.1
                });
            }
        }
    }]);
