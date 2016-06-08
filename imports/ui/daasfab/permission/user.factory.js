import angular from 'angular';
import './role.factory';

angular.module('app.permission').factory('UserService', UserService);

UserService.$inject = ['$q', '$http', 'RoleService'];

/* @ngInject */
function UserService($q, $http, RoleService) {
    var currentUser = {
        displayName: 'Christos',
        username: 'christos',
        avatar: 'assets/images/avatars/avatar-5.png',
        roles: ['SUPERADMIN']
    };

    var service = {
        getCurrentUser: getCurrentUser,
        getUsers: getUsers,
        hasPermission: hasPermission,
        login: login
    };

    return service;

    ///////////////

    function getCurrentUser() {
        return currentUser;
    }

    function getUsers() {
        return $http.get('app/permission/data/users.json');
    }

    function hasPermission(permission) {
        var deferred = $q.defer();
        var hasPermission = false;

        // check if user has permission via its roles
        angular.forEach(currentUser.roles, function (role) {
            // check role exists
            if (RoleService.hasRoleDefinition(role)) {
                // get the role
                var roleDef = RoleService.getRoleDefinition(role);
                // check if the permission we are validating is in this role's permissions
                if (-1 !== roleDef.permissionNames.indexOf(permission)) {
                    hasPermission = true;
                }
            }
        });

        // if we have permission resolve otherwise reject the promise
        if (hasPermission) {
            deferred.resolve();
        }
        else {
            deferred.reject();
        }

        // return promise
        return deferred.promise;
    }

    function login(username) {
        // you would replace the code below with a call you your API
        // request all users
        return getUsers()
            .then(function successCallback(response) {
                var returnUser = getCurrentUser();
                angular.forEach(response.data, function (user) {
                    if (user.username === username) {
                        returnUser = user;
                        currentUser = user;
                    }
                });
                return returnUser;
            });
    }
}
