import angular from 'angular';
import './authentication.module';
import './authentication.config';
/**
 * @ngdoc module
 * @name kaiamAuthentication
 * @description
 *
 * The `kaiamAuthentication` module adds an login page
 */
angular.module('kaiamAuthentication').config(run);
run.$inject = [];
function run () {

}

