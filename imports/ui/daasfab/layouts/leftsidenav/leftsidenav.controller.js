import angular from 'angular';

angular
    .module('triangular.components')
    .controller('LeftSidenavController', LeftSidenavController);

LeftSidenavController.$inject = ['triSettings', 'triLayout'];

/* @ngInject */
function LeftSidenavController(triSettings, triLayout) {
    let vm = this;
    vm.layout = triLayout.layout;
    vm.version = Settings.site.version;
    vm.sidebarInfo = {
        appName: triSettings.name,
        appLogo: triSettings.logo
    };
    vm.toggleIconMenu = toggleIconMenu;

    ////////////

    function toggleIconMenu() {
        let menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
        triLayout.setOption('sideMenuSize', menu);
    }
}

