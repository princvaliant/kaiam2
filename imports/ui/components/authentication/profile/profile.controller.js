/**
 * @ngdoc function
 * @name ProfileController
 * @module triAngularAuthentication
 * @kind function
 *
 * @description
 *
 * Handles settings form fields
 */
angular.module('kaiamAuthentication')
.controller('ProfileController', ['$scope', '$state', function ($scope, $state) {
    // create blank user variable for login form
    $scope.user = {
        name: '',
        email: '',
        location: '',
        website: '',
        twitter: '',
        bio: '',
        current: '',
        password: '',
        confirm: ''
    };

    // create some dummy user settings
    $scope.settingsGroups = [{
        name: 'ADMIN.NOTIFICATIONS.ACCOUNT_SETTINGS',
        settings: [{
            title: 'ADMIN.NOTIFICATIONS.SHOW_LOCATION',
            icon: 'icon-location-on',
            enabled: true
        },{
            title: 'ADMIN.NOTIFICATIONS.SHOW_AVATAR',
            icon: 'icon-face-unlock',
            enabled: false
        },{
            title: 'ADMIN.NOTIFICATIONS.SEND_NOTIFICATIONS',
            icon: 'icon-notifications-on',
            enabled: true
        }]
    },{
        name: 'ADMIN.NOTIFICATIONS.CHAT_SETTINGS',
        settings: [{
            title: 'ADMIN.NOTIFICATIONS.SHOW_USERNAME',
            icon: 'icon-person',
            enabled: true
        },{
            title: 'ADMIN.NOTIFICATIONS.SHOW_PROFILE',
            icon: 'icon-account-box',
            enabled: false
        },{
            title: 'ADMIN.NOTIFICATIONS.ALLOW_BACKUPS',
            icon: 'icon-backup',
            enabled: true
        }]
    }];

    // controller to handle login check
    $scope.updateSettingsClick = function() {
        // TODO:probably display a toast here.
        $state.go('admin-panel.default.profile');
    };
}]);
