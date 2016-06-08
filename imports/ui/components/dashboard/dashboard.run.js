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

angular.module('kaiamDashboard').run(['$rootScope', 'triMenu', '$meteor', '$translate',
    function($rootScope, triMenu, $meteor, $translate) {
    let user;

    $rootScope.$on('event:loginConfirmed', function() {
        initMenu();
    });
    $meteor.waitForUser().then(function() {
        initMenu();
    });

    function initMenu() {
     //   if (user) {
     //       return;
      //  }
    //    user = Meteor.users.findOne(Meteor.userId());
    //    if (user && !user.profile.isClient && _.contains(user.profile.roles, 'DASHBOARD_ACCESS')) {
        triMenu.addMenu({
                type: 'link',
                name: 'MENU.DASHBOARDS.DASHBOARDS',
                state: 'triangular.dashboard',
                icon: 'dashboard',
                badge: 1,
                priority: 1.1
            });


    //    }
    }
}]);
