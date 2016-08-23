import angular from 'angular';

angular
    .module ('kaiamTransceiverView')
    .controller ('GalleryDialogController', GalleryDialogController);

GalleryDialogController.$inject = ['$scope', 'eye'];

/* @ngInject */
function GalleryDialogController ($scope, eye) {
    $scope.eye = eye;
}

