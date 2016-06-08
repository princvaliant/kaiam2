import angular from 'angular';

angular.module('triangular.directives').directive('themeBackground', themeBackground);

themeBackground.$inject = ['$mdTheming', 'triTheming'];

/* @ngInject */
function themeBackground($mdTheming, triTheming) {
    // Usage:
    // ```html
    // <div md-theme="cyan" theme-background="primary|accent|warn|background:default|hue-1|hue-2|hue-3">Coloured content</div>
    // ```
    // Creates:
    //
    let directive = {
        link: link,
        restrict: 'A'
    };
    return directive;

    function link($scope, $element, attrs) {
        $mdTheming($element);

        // make sure we have access to the theme - causes an eslint but nothing we can do about AM naming
        let $mdTheme = $element.controller('mdTheme'); //eslint-disable-line
        if (angular.isDefined($mdTheme)) {
            let intent = attrs.themeBackground;
            let hue = 'default';

            // check if we have a hue provided
            if (intent.indexOf(':') !== -1) {
                let splitIntent = attrs.themeBackground.split(':');
                intent = splitIntent[0];
                hue = splitIntent[1];
            }
            // get the color and apply it to the element
            let color = triTheming.getThemeHue($mdTheme.$mdTheme, intent, hue);
            if (angular.isDefined(color)) {
                $element.css({
                    'background-color': triTheming.rgba(color.value),
                    'border-color': triTheming.rgba(color.value),
                    'color': triTheming.rgba(color.contrast)
                });
            }
        }
    }
}
