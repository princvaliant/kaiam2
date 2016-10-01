'use strict';

import angular from 'angular';


/**
 * @ngdoc function
 * @name EpromCompareController
 * @module kaiamEprom
 * @kind function
 *
 *
 */
angular.module('kaiamEprom').controller('EpromCompareController', [
    '$scope', '$rootScope', '$log', '$state', '$mdToast', '$cookies', '$meteor', '$mdDialog', '$location', '$window',
    '$translate', '$translatePartialLoader', 'SpecActionsService', 'Upload',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader, SpecActionsService, Upload) => {
        $translatePartialLoader.addPart('eprom');
        $translate.refresh();
        $scope.pages = [];
        for (let i = 0; i <= 21; i++) {
            $scope.pages.push(i);
        }
        $scope.page = 0;
        $scope.serial1 = 'Q3565';
        $scope.serial2 = 'Q3445';
        $scope.showProgress = false;
        $scope.columns = [{
            min: 128,
            max: 159
        }, {
            min: 160,
            max: 191
        }, {
            min: 192,
            max: 223
        }, {
            min: 224,
            max: 255
        }];
        let memory = [0, 0];

        $scope.pageChange = function (page) {
            $scope.page = page;
            showPage();
        };

        $scope.export = function (serial) {
            Meteor.call('exportEprom', serial === $scope.serial1 ? $scope.data1 : $scope.data2,
                (err, data) => {
                    if (err) {
                        showError(err);
                    } else {
                        window.open('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + encodeURIComponent(data));
                    }
                });
        };

        $scope.load = function (serial, idx) {
            memory[idx] = '';
            $scope['fileName' + (idx + 1)] = '';
            loadFromPackout(serial, idx);
        };

        $scope.upload = function (file, idx) {
            memory[idx] = '';
            $scope['serial' + (idx + 1)] = '';
            uploadFromFile(file, idx);
        };

        function uploadFromFile (file, idx) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                SpecActionsService.readFileAsync(resp.config.data.file).then(function (fileInputContent) {
                    console.log(resp.config.data.file.name);
                });
            });
        };

        function loadFromPackout (serial, idx) {
            if (serial) {
                Meteor.call('getLastPackout', serial,
                    (err, data) => {
                        if (err) {
                            showError(err);
                        } else {
                            if (!data) {
                                showError('No packout data for serial ' + serial);
                            }
                            memory[idx] = data.data.MemoryDump;
                        }
                        compare();
                    });
            }
        }

        function compare () {
            let data1 = pagify(memory[0]);
            let data2 = pagify(memory[1]);
            process(data1, data2);
            $scope.data1 = data1;
            $scope.data2 = data2;
            showPage();
            $scope.$apply();
        }

        function pagify (memoryString) {
            let pages = {};
            if (memoryString) {
                _.each($scope.pages, (page) => {
                    let pageData = memoryString.substring(page * 512, page * 512 + 512);
                    pages[page] = {
                        diff: '',
                        list: _.map(pageData.match(/.{1,2}/g), (r) => {
                            return {
                                diff: '',
                                val: String.fromCharCode(parseInt(r, 16)),
                                hex: r
                            };
                        })
                    };
                });
            }
            return pages;
        }

        function process (data1, data2) {
            if (data1 && data2) {
                for (let key in data1) {
                    if (!data1.hasOwnProperty(key)) continue;
                    let obj1 = data1[key];
                    let obj2 = data2[key];
                    for (let i = 128; i < 256; i++) {
                        if (obj1.list[i].hex !== obj2.list[i].hex) {
                            obj1.diff = 'btnred';
                            obj2.diff = 'btnred';
                            obj1.list[i].diff = 'red';
                            obj2.list[i].diff = 'red';
                        }
                    }
                }
            }
        }

        function showPage () {
            $scope.pageData1 = $scope.data1[$scope.page];
            $scope.pageData2 = $scope.data2[$scope.page];
        }

        function showError (err) {
            $mdToast.show(
                $mdToast.simple()
                    .content(err)
                    .position('bottom right')
                    .hideDelay(3000));
            $scope.pageData1 = null;
            $scope.pageData2 = null;
            $scope.data1 = null;
        }
    }
]);
