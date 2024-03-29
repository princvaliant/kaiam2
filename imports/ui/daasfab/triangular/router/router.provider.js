import angular from 'angular';

angular.module('triangular').provider('triRoute', routeProvider);

/* @ngInject */
function routeProvider() {
    // Provider
    let settings = {
        docTitle: '',
        separator: ''
    };

    this.setTitle = setTitle;
    this.setSeparator = setSeparator;
    this.$get = routeHelper;

    function setTitle(title) {
        settings.docTitle = title;
    }

    function setSeparator(separator) {
        settings.separator = separator;
    }

    // Service
    function routeHelper() {
        return {
            title: settings.docTitle,
            separator: settings.separator
        };
    }
}


