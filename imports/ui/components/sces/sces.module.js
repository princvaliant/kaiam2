'use strict';

import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import ngFileUpload from 'ng-file-upload';
import ngMessages from 'angular-messages';
import '../../daasfab/triangular/directives/palette-background.directive';


/**
 * @ngdoc module
 * @name kaiamSces
 * @description
 *
 * The `kaiamSces` module contains UI for all the settings in application
 */
angular.module('kaiamSces', [
  angularMeteor,
  uiRouter,
  ngFileUpload,
  ngMessages
]);
