import angular from 'angular';

angular.module('triangular.components').filter('startFrom', startFrom);

startFrom.$inject = [];

function startFrom() {
    return filterFilter;

    function filterFilter(input, start) {
        start = +start;
        return input.slice(start);
    }
}
