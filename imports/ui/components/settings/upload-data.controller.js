'use strict';

import angular from 'angular';
import {Meteor} from 'meteor/meteor';


/**
 * @ngdoc function
 * @name UploadDataController
 * @module kaiamSces
 * @kind function
 *
 *
 */
angular.module('kaiamSettings').controller('SettingsUploadDataController', [
    '$rootScope', '$scope', '$log', '$mdToast', '$location', '$translate', '$translatePartialLoader', '$q',
    'Upload', ($rootScope, $scope, $log, $mdToast, $location, $translate, $translatePartialLoader, $q,
               Upload) => {
        $translatePartialLoader.addPart('sces');
        $translate.refresh();

        $scope.upload = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                if (resp.config.data.file) {
                    readFileAsync(resp.config.data.file).then(function (fileInputContent) {
                        let data = Papa.parse(fileInputContent);
                        Meteor.call('importRosaData', data.data,
                            (err) => {
                                if (err) {
                                    $scope.importedMessage = 'Error status: ' + err;
                                } else {
                                    $scope.importedMessage = resp.config.data.file.name + ' successfully uploaded.';
                                }
                            });
                    });
                }
            }, function (resp) {
                $scope.importedMessage = 'Error status: ' + resp.status;
            });

        };

        function readFileAsync (file) {
            let deferred = $q.defer();
            let fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            return deferred.promise;
        }
    }
]);


