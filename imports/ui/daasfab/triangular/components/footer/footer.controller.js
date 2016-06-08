import angular from 'angular';
import './footer.tmpl.html';

angular.module('triangular.components').controller('FooterController', FooterController);

FooterController.$inject = ['triSettings', 'triLayout'];

/* @ngInject */
function FooterController(triSettings, triLayout) {
    let vm = this;
    vm.name = triSettings.name;
    vm.copyright = triSettings.copyright;
    vm.layout = triLayout.layout;
    vm.version = triSettings.version;
}