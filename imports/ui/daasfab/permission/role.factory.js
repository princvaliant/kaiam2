import angular from 'angular';

angular
    .module('app.permission')
    .factory('RoleService', RoleService);

/* @ngInject */
function RoleService() {

    var service = {
        defineRole: defineRole,
        getRoleDefinition: getRoleDefinition,
        hasRoleDefinition: hasRoleDefinition
    };

    return service;

    ///////////////

    function defineRole() {
        return '';
    }

    function getRoleDefinition() {
        return '';
    }

    function hasRoleDefinition() {
        return true;
    }
}
