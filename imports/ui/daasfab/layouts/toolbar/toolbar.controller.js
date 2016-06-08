import angular from 'angular';
import '../../permission/user.factory';

angular
    .module('triangular.components')
    .controller('ToolbarController', DefaultToolbarController);

DefaultToolbarController.$inject = ['$scope', '$injector', '$rootScope', '$mdMedia', '$filter', '$mdUtil', '$mdSidenav', '$mdToast',  '$document', 'triBreadcrumbsService', 'triSettings', 'triLayout', 'UserService'];

/* @ngInject */
function DefaultToolbarController($scope, $injector, $rootScope, $mdMedia, $filter, $mdUtil, $mdSidenav, $mdToast,  $document, triBreadcrumbsService, triSettings, triLayout, UserService) {
    let vm = this;
    vm.breadcrumbs = triBreadcrumbsService.breadcrumbs;
    vm.emailNew = false;
    vm.languages = triSettings.languages;
    vm.openSideNav = openSideNav;
    vm.hideMenuButton = hideMenuButton;
    vm.switchLanguage = switchLanguage;
    vm.toggleNotificationsTab = toggleNotificationsTab;
    vm.isFullScreen = false;
    vm.fullScreenIcon = 'zmdi zmdi-fullscreen';
    vm.toggleFullScreen = toggleFullScreen;
    vm.currentUser = UserService.getCurrentUser();

    ////////////////

    function openSideNav(navID) {
        $mdUtil.debounce(function () {
            $mdSidenav(navID).toggle();
        }, 300)();
    }

    function switchLanguage(languageCode) {
        if ($injector.has('$translate')) {
            let $translate = $injector.get('$translate');
            $translate.use(languageCode)
                .then(function () {
                    $mdToast.show(
                        $mdToast.simple()
                            .content($filter('triTranslate')('Language Changed'))
                            .position('bottom right')
                            .hideDelay(500)
                    );
                    $rootScope.$emit('changeTitle');
                });
        }
    }

    function hideMenuButton() {
        switch (triLayout.layout.sideMenuSize) {
            case 'hidden':
                // always show button if menu is hidden
                return false;
            case 'off':
                // never show button if menu is turned off
                return true;
            default:
                // show the menu button when screen is mobile and menu is hidden
                return $mdMedia('gt-sm');
        }
    }

    function toggleNotificationsTab(tab) {
        $rootScope.$broadcast('triSwitchNotificationTab', tab);
        vm.openSideNav('notifications');
    }

    function toggleFullScreen() {
        vm.isFullScreen = !vm.isFullScreen;
        vm.fullScreenIcon = vm.isFullScreen ? 'zmdi zmdi-fullscreen-exit' : 'zmdi zmdi-fullscreen';
        // more info here: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
        let doc = $document[0];
        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            if (doc.documentElement.requestFullscreen) {
                doc.documentElement.requestFullscreen();
            } else if (doc.documentElement.msRequestFullscreen) {
                doc.documentElement.msRequestFullscreen();
            } else if (doc.documentElement.mozRequestFullScreen) {
                doc.documentElement.mozRequestFullScreen();
            } else if (doc.documentElement.webkitRequestFullscreen) {
                doc.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            }
        }
    }

    $scope.$on('newMailNotification', function () {
        vm.emailNew = true;
    });
}

