import angular from 'angular';

angular
    .module('triangular')
    .filter('triTranslate', triTranslateFilter);

triTranslateFilter.$inject =  ['$injector', '$filter'];

/* @ngInject */
function triTranslateFilter ($injector, $filter) {
    return function (input) {
        // if angular translate installed this will return true
        // so we can translate
        if ($injector.has('translateFilter')) {
            return $filter('translate')(input);
        }
        else {
            // no translation active so just return the same input
            return input;
        }
    };
}
