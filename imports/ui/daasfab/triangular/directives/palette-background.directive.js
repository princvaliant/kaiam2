import angular from 'angular';

angular.module('triangular.directives').directive('paletteBackground', paletteBackground);

paletteBackground.$inject = ['triTheming'];

/* @ngInject */
function paletteBackground (triTheming) {
    // Usage:
    // ```html
    // <div palette-background="green:500">Coloured content</div>
    // ```
    //
    // Creates:
    //
    let directive = {
        link: link,
        restrict: 'A'
    };
    return directive;

    function link ($scope, $element, attrs) {
        let splitColor = attrs.paletteBackground.split(':');
        let color = triTheming.getPaletteColor(splitColor[0], splitColor[1]);

        if (angular.isDefined(color)) {
            $element.css({
                'background-color': triTheming.rgba(color.value),
                'border-color': triTheming.rgba(color.value),
                'color': triTheming.rgba(color.contrast)
            });
        }
    }
}
