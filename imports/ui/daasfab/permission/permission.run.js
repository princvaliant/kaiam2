import angular from 'angular';
import './permission.module';
import './role.factory';
import './user.factory';
import './permission.config';

angular.module('app.permission').run(permissionRun);

permissionRun.$inject = ['$rootScope', '$cookies', '$state', 'RoleService', 'UserService'];

function permissionRun($rootScope, $cookies, $state, RoleService, UserService) {
    // normally this would be done at the login page but to show quick
    // demo we grab username from cookie and login the user
    let cookieUser = $cookies.get('tri-user');
    if (angular.isDefined(cookieUser)) {
        UserService.login(cookieUser);
    }

    // create roles for app
    RoleService
        .defineRole('SUPERADMIN', ['viewEmail', 'viewGitHub', 'viewCalendar', 'viewLayouts', 'viewTodo', 'viewElements', 'viewAuthentication', 'viewCharts', 'viewMaps'], checkRole);
    RoleService
        .defineRole('ADMIN', ['viewLayouts', 'viewTodo', 'viewElements', 'viewAuthentication', 'viewCharts', 'viewMaps'], checkRole);
    RoleService
        .defineRole('USER', ['viewAuthentication', 'viewCharts', 'viewMaps'], checkRole);
    RoleService
        .defineRole('ANONYMOUS', [], checkRole);


    ///////////////////////

    // default redirect if access is denied
    function accessDenied() {
        $state.go('401');
    }

    // function that calls user service to check if permission is allowed
    function checkRole(permission, transitionProperties) {
        return UserService.hasPermission(permission, transitionProperties);
    }

    // watches

    // redirect all denied permissions to 401
    let deniedHandle = $rootScope.$on('$stateChangePermissionDenied', accessDenied);

    // remove watch on destroy
    $rootScope.$on('$destroy', function () {
        deniedHandle();
    });
}
