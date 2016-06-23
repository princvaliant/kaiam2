import angular from 'angular';

angular.module('triangular.components').controller('NotificationsPanelController', NotificationsPanelController);

NotificationsPanelController.$inject = ['$scope', '$http', '$mdSidenav', '$state', 'API_CONFIG'];

/* @ngInject */
function NotificationsPanelController($scope, $http, $mdSidenav, $state, API_CONFIG) {
    let vm = this;
    // sets the current active tab
    vm.close = close;
    vm.currentTab = 0;
    vm.notificationGroups = [{
        name: 'Twitter',
        notifications: [{
            title: 'Mention from oxygenna',
            icon: 'fa fa-twitter',
            iconColor: '#55acee',
            date: moment().startOf('hour')
        }, {
            title: 'Oxygenna',
            icon: 'fa fa-twitter',
            iconColor: '#55acee',
            date: moment().startOf('hour')
        }, {
            title: 'Oxygenna',
            icon: 'fa fa-twitter',
            iconColor: '#55acee',
            date: moment().startOf('hour')
        }, {
            title: 'Followed by Oxygenna',
            icon: 'fa fa-twitter',
            iconColor: '#55acee',
            date: moment().startOf('hour')
        }]
    }, {
        name: 'Server',
        notifications: [{
            title: 'Server Down',
            icon: 'zmdi zmdi-alert-circle',
            iconColor: 'rgb(244, 67, 54)',
            date: moment().startOf('hour')
        }, {
            title: 'Slow Response Time',
            icon: 'zmdi zmdi-alert-triangle',
            iconColor: 'rgb(255, 152, 0)',
            date: moment().startOf('hour')
        }, {
            title: 'Server Down',
            icon: 'zmdi zmdi-alert-circle',
            iconColor: 'rgb(244, 67, 54)',
            date: moment().startOf('hour')
        }]
    }, {
        name: 'Sales',
        notifications: [{
            title: 'Triangular Admin $21',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }, {
            title: 'Lambda WordPress $60',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }, {
            title: 'Triangular Admin $21',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }, {
            title: 'Triangular Admin $21',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }, {
            title: 'Lambda WordPress $60',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }, {
            title: 'Triangular Admin $21',
            icon: 'zmdi zmdi-shopping-cart',
            iconColor: 'rgb(76, 175, 80)',
            date: moment().startOf('hour')
        }]
    }];
    vm.openMail = openMail;
    vm.settingsGroups = [{
        name: 'Account Settings',
        settings: [{
            title: 'Show my location',
            icon: 'zmdi zmdi-pin',
            enabled: true
        }, {
            title: 'Show my avatar',
            icon: 'zmdi zmdi-face',
            enabled: false
        }, {
            title: 'Send me notifications',
            icon: 'zmdi zmdi-notifications-active',
            enabled: true
        }]
    }, {
        name: 'Chat Settings',
        settings: [{
            title: 'Show my username',
            icon: 'zmdi zmdi-account',
            enabled: true
        }, {
            title: 'Make my profile public',
            icon: 'zmdi zmdi-account-box',
            enabled: false
        }, {
            title: 'Allow cloud backups',
            icon: 'zmdi zmdi-cloud-upload',
            enabled: true
        }]
    }];

    vm.statisticsGroups = [{
        name: 'User Statistics',
        stats: [{
            title: 'Storage Space (120/160 Gb)',
            mdClass: 'md-primary',
            value: 60
        }, {
            title: 'Bandwidth Usage (10/100 Gb)',
            mdClass: 'md-accent',
            value: 10
        }, {
            title: 'Memory Usage (1/8 Gb)',
            mdClass: 'md-warn',
            value: 100
        }]
    }, {
        name: 'Server Statistics',
        stats: [{
            title: 'Storage Space (120/160 Gb)',
            mdClass: 'md-primary',
            value: 60
        }, {
            title: 'Bandwidth Usage (10/100 Gb)',
            mdClass: 'md-accent',
            value: 10
        }, {
            title: 'Memory Usage (1/8 Gb)',
            mdClass: 'md-warn',
            value: 100
        }]
    }];

    ////////////////

    // add an event to switch tabs (used when user clicks a menu item before sidebar opens)
    $scope.$on('triSwitchNotificationTab', function ($event, tab) {
        vm.currentTab = tab;
    });

    // fetch some dummy emails from the API
    // $http({
    //     method: 'GET',
    //     url: API_CONFIG.url + 'email/inbox'
    // }).success(function (data) {
    //     vm.emails = data.slice(1, 20);
    // });

    function openMail() {
        $state.go('triangular-no-scroll.email.inbox');
        vm.close();
    }

    function close() {
        $mdSidenav('notifications').close();
    }
}
