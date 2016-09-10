import angular from 'angular';

angular
    .module('daasfab')
    .controller('ErrorPageController', ErrorPageController);

ErrorPageController.$inject = ['$state'];

/* @ngInject */
function ErrorPageController ($state) {
    var vm = this;

    vm.goHome = goHome;

    /////////

    function goHome () {
        $state.go('triangular.dashboard');
    }
}

