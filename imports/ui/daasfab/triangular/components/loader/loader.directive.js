import angular from 'angular';
import './loader-service';

angular.module('triangular.components').directive('triLoader', TriLoader);

TriLoader.$inject = [];
TriLoaderController.$inject = ['$rootScope', 'triLoaderService', 'triSettings'];

/* @ngInject */
function TriLoader() {
    let directive = {
        bindToController: true,
        controller: TriLoaderController,
        controllerAs: 'vm',
        template: '<div flex class="loader padding-100" ng-show="vm.isActive()" layout="column" layout-fill layout-align="center center"><h3 class="md-headline">{{vm.triSettings.name}}</h3><md-progress-linear md-mode="indeterminate"></md-progress-linear></div>',
        restrict: 'E',
        replace: true,
        scope: {}
    };
    return directive;
}

/* @ngInject */
function TriLoaderController($rootScope, triLoaderService, triSettings) {
    let vm = this;
    vm.triSettings = triSettings;
    vm.isActive = triLoaderService.isActive;
}

