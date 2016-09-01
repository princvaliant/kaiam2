import angular from 'angular';
import './dashboard.module';
import './dashboard.config';
import '/imports/ui/daasfab/triangular/components/menu/menu.provider';
/**
 * @ngdoc module
 * @name kaiamDashboard
 * @description
 *
 * The `kaiamDashboard` module adds an dashboard page
 */

angular.module('kaiamDashboard').run(['$rootScope', 'triMenu', '$meteor',
    function ($rootScope, triMenu, $meteor) {
        let user;

        function initMenu() {
            if (user) {
                return;
            }
            user = Meteor.user();
            if (user && !user.profile.isClient && _.contains(user.profile.roles, 'DASHBOARD_ACCESS')) {
                triMenu.addMenu({
                    type: 'link',
                    name: 'MENU.DASHBOARDS.DASHBOARDS',
                    state: 'triangular.dashboard',
                    icon: 'dashboard',
//                    badge: 1,
                    priority: 1.0
                });
            }
        }

        $rootScope.$on('event:loginConfirmed', () => {
            initMenu();
        });

        $meteor.waitForUser().then(() => {
            initMenu();
        });
    }]);
