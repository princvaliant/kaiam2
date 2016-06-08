import angular from 'angular';

angular.module('daasfab').controller('AppFooterController', FooterController);

FooterController.$inject = ['triLayout', 'triSettings'];

/* @ngInject */
function FooterController(triLayout, triSettings) {
    let vm = this;
    vm.layout = triLayout;
    vm.settings = triSettings;
}

