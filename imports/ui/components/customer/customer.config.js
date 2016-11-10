'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
import './customer.module';
import './customer.controller';
import './customer.tmpl.html';
import './transceivers.controller';
import './transceivers.tmpl.html';
import './transceiver.controller';
import './transceiver.tmpl.html';
/**
 * @ngdoc module
 * @name kaiamCustomer
 * @description
 *
 * The `kaiamCustomer` module adds an introduction page
 */
angular.module('kaiamCustomer')
    .config(['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart('transceiver');

            $stateProvider.state ('triangular.customer', {
                abstract: true,
                url: '',
                templateUrl: 'imports/ui/components/customer/customer.tmpl.html',
                controller: 'CustomerController'
            });
            $stateProvider.state ('triangular.customer.transceivers', {
                url: '/transceivers',
                views: {
                    'contentcustomer': {
                        templateUrl: 'imports/ui/components/customer/transceivers.tmpl.html',
                        controller: 'TransceiversController'
                    }
                }
            });
            $stateProvider.state ('triangular.customer.transceiverdata', {
                url: '/transceiver?id=',
                views: {
                    'contentcustomer': {
                        templateUrl: 'imports/ui/components/customer/transceiver.tmpl.html',
                        controller: 'TransceiverController'
                    }
                }
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
            if (user && user.profile.isClient) {
                triMenu.addMenu({
                    type: 'link',
                    name: 'Transceivers',
                    state: 'triangular.customer.transceivers',
                    icon: 'perm_device_information',
                    priority: 6.1
                });
            }
        }
    }]);
