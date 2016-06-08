import angular from 'angular';

angular.module('triangular.components').controller('DefaultToolbarController', DefaultToolbarController);

DefaultToolbarController.$inject = ['$scope', '$injector', '$rootScope', '$mdMedia', '$filter', '$mdUtil', '$mdSidenav', '$mdToast', '$document', 'triBreadcrumbsService', 'triSettings', 'triLayout'];

/* @ngInject */
function DefaultToolbarController($scope, $injector, $rootScope, $mdMedia,  $filter, $mdUtil, $mdSidenav, $mdToast, $document, triBreadcrumbsService, triSettings, triLayout) {
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

    // initToolbar();

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
        return triLayout.layout.sideMenuSize !== 'hidden' && $mdMedia('gt-sm');
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

