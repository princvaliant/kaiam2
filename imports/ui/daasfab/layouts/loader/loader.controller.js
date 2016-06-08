import angular from 'angular';


angular
    .module('daasfab')
    .controller('LoaderController', LoaderController);

LoaderController.$inject = ['triSettings'];

/* @ngInject */
function LoaderController(triSettings) {
    let vm = this;
    vm.triSettings = triSettings;
}

