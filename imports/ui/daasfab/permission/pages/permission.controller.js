import angular from 'angular';

    angular
        .module('app.permission')
        .controller('PermissionController', PermissionController);

    /* @ngInject */
    function PermissionController($state, $window, $cookies, RoleService, PermissionStore, UserService, users) {
        var vm = this;
        vm.userList = users.data;
        vm.roleList = [];
        vm.permissionList = [];
        vm.allRoles = RoleService.getStore();
        vm.allPermissions = PermissionStore.getStore();

        vm.loginClick = loginClick;
        vm.selectUser = selectUser;

        ////////////////

        function init() {
            var currentUser = UserService.getCurrentUser();
            angular.forEach(users.data, function(user) {
                if(user.username === currentUser.username) {
                    selectUser(user);
                }
            });
        }

        function loginClick() {
            // store username in a cookie so we can load after reload
            $cookies.put('tri-user', vm.selectedUser.username);
            $window.location.reload();
        }

        function selectUser(user) {
            vm.selectedUser = user;
            vm.roleList = [];
            vm.permissionList = [];
            // find first role and select that
            angular.forEach(vm.allRoles, function(role) {
                if(-1 !== vm.selectedUser.roles.indexOf(role.roleName)) {
                    // add this users roles to the list
                    vm.roleList.push(role);
                    angular.forEach(role.permissionNames, function(permission) {
                        vm.permissionList.push(permission);
                    });
                }
            });
        }

        // init

        init();
    }
