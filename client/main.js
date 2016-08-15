import angular from 'angular';
import {Meteor} from 'meteor/meteor';
import {name as Daasfab} from '../imports/ui/daasfab/daasfab.module';

import '../imports/ui/daasfab/translate.filter';
import '../imports/ui/daasfab/error-page.controller';
import '../imports/ui/daasfab/daasfab.config';
import '../imports/ui/daasfab/config.triangular.layout';
import '../imports/ui/daasfab/config.triangular.settings';
import '../imports/ui/daasfab/config.triangular.themes';
import '../imports/ui/daasfab/daasfab.run';

function onReady () {
    angular.bootstrap(document, [
        Daasfab
    ], {
        strictDi: true
    });
}

if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
} else {
    angular.element(document).ready(onReady);
}