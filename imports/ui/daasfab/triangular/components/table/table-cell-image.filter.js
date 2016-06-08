import angular from 'angular';

angular.module('triangular.components').filter('tableImage', tableImage);

tableImage.$inject = ['$sce'];

function tableImage($sce) {
    return filterFilter;

    function filterFilter(value) {
        return $sce.trustAsHtml('<div style=\"background-image: url(\'' + value + '\')\"/>');
    }
}