import angular from 'angular';
import 'angular-mocks/angular-mocks';
import 'angular-translate';
import 'angular-translate/dist/angular-translate';
import 'angular-translate/dist/angular-translate-storage-local/angular-translate-storage-local';
import 'angular-translate/dist/angular-translate-storage-cookie/angular-translate-storage-cookie';
import 'angular-translate/dist/angular-translate-loader-partial/angular-translate-loader-partial';

angular.module('app.translate', [
            'pascalprecht.translate',
            'LocalStorageModule'
        ]);
