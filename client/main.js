import angular from 'angular';
import {Meteor} from 'meteor/meteor';

import {name as KaiamCloud} from '../imports/ui/daasfab/daasfab.module';

import '../imports/ui/daasfab/translate.filter';
import '../imports/ui/daasfab/error-page.controller';
import '../imports/ui/daasfab/daasfab.config';
import '../imports/ui/daasfab/config.triangular.layout';
import '../imports/ui/daasfab/config.triangular.settings';
import '../imports/ui/daasfab/config.triangular.themes';
import '../imports/ui/daasfab/daasfab.run';

Meteor.startup(function () {

    function onReady () {
        Meteor.subscribe('partNumbers');
        setTimeout(() => {
            angular.bootstrap(document, [
                KaiamCloud
            ], {
                strictDi: true
            });
        }, 500);
    }

    if (Meteor.isCordova) {
        angular.element(document).on('deviceready', onReady);
    } else {
        angular.element(document).ready(onReady);
    }
});