import angular from 'angular';
import './charts.module';
import './charts.config';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
/**
 * @ngdoc module
 * @name kaiam.spcs
 * @description
 *
 * The `kaiam.spcs` module handles statistical process control charts.
 */
angular.module('kaiamCharts')
    .run(['$rootScope', 'triMenu', '$meteor',
        function ($rootScope, triMenu, $meteor) {
            let user;
            function initMenu () {
                if (user) {
                    return;
                }
                user = Meteor.users.findOne(Meteor.userId());
                if (user && !user.profile.isClient && _.contains(user.profile.roles, 'DASHBOARD_ACCESS')) {
                    triMenu.addMenu({
                        name: 'MENU.CHARTS.PACKOUT',
                        icon: 'archive',
                        type: 'link',
                        state: 'triangular.packout',
                        priority: 1.1
                    });
                    let analysismenu = {
                        name: 'MENU.CHARTS.ANALYSIS',
                        icon: 'assessment',
                        type: 'dropdown',
                        priority: 1.15,
                        children: []
                    };
                    analysismenu.children.push({
                        name: 'MENU.CHARTS.POWERCALBEFORETX',
                        type: 'link',
                        state: 'triangular.powercalbeforetx',
                        priority: 1.15
                    });
                    analysismenu.children.push({
                        name: 'MENU.CHARTS.TESTSPEED',
                        type: 'link',
                        state: 'triangular.testspeed',
                        priority: 1.16
                    });
                    triMenu.addMenu(analysismenu);
                    let yieldmenu = {
                        name: 'MENU.CHARTS.YIELD',
                        icon: 'thumb_up',
                        type: 'dropdown',
                        priority: 1.2,
                        children: []
                    };

                    yieldmenu.children.push({
                        name: 'MENU.CHARTS.YIELDPARAMETRIC',
                        type: 'link',
                        state: 'triangular.yieldcheck',
                        priority: 1.4
                    });
                    yieldmenu.children.push({
                        name: 'MENU.CHARTS.LOSS',
                        type: 'link',
                        state: 'triangular.losscheck',
                        priority: 1.5
                    });
                    triMenu.addMenu(yieldmenu);

                    createChartMenus(Settings.testConfig, 'MENU.CHARTS.TIMETREND',
                        'triangular.timetrend', 'timeline', 2.1);
                    createChartMenus(Settings.spcData, 'MENU.CHARTS.SPCS',
                        'triangular.spcs', 'linear_scale', 3.1);
                }
            }

            function createChartMenus(setting, title, state, icon, order) {
                let menu = {
                    name: title,
                    icon: icon,
                    type: 'dropdown',
                    priority: order,
                    children: []
                };
                // Loop through variables for timetrend and menus for each group
                _.each(setting, function (value, key) {
                    let mi = {
                        name: 'MENU.CHARTS.' + key.toUpperCase() + '.' + key.toUpperCase(),
                        type: 'dropdown',
                        priority: 2.2,
                        children: []
                    };
                    _.each(value, function (value2, key2) {
                        mi.children.push({
                            name: 'MENU.CHARTS.' + key.toUpperCase() + '.' + key2.toUpperCase(),
                            state: state,
                            type: 'link',
                            params: {
                                type: key,
                                subtype: key2
                            }
                        });
                    });
                    menu.children.push(mi);
                });
                triMenu.addMenu(menu);
            }

            $rootScope.$on('event:loginConfirmed', () => {
                initMenu();
            });
            $meteor.waitForUser().then(function () {
                initMenu();
            });
        }
    ]);
