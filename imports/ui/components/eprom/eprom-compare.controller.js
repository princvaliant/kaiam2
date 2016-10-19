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
        $scope.serial1 = 'Q5169';
        $scope.serial2 = 'Q4532';
        $scope.serialDump1 = 'Q1848';
        $scope.serialDump2 = 'Q1848';

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
        let load = '';

        $scope.pageChange = function (page) {
            $scope.page = page;
            showPage();
        };

        $scope.export = function (idx) {
            let serial = '';
            let dt = idx === 1 ? $scope.data1 : $scope.data2;
            if (load === 'packout') {
                serial = idx === 1 ? $scope.serial1 : $scope.serial2;
            }
            if (load === 'memory') {
                serial = idx === 1 ? $scope.serialDump1 : $scope.serialDump2;
            }
            Meteor.call('exportEprom', dt,
                (err, data) => {
                    if (err) {
                        showError(err);
                    } else {
                        let a = document.createElement('a');
                        document.body.appendChild(a);
                        a.style.display = 'none';
                        a.href = encodeURI('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data);
                        a.download = serial;
                        a.click();
                    }
                });
        };

        $scope.load = function (serial, idx) {
            memory[idx] = '';
            $scope['fileName' + (idx + 1)] = '';
            $scope['serialDump' + (idx + 1)] = '';
            loadFromPackout(serial, idx);
            load = 'packout';
        };

        $scope.loadDump = function (serial, idx) {
            memory[idx] = '';
            $scope['fileName' + (idx + 1)] = '';
            $scope['serial' + (idx + 1)] = '';
            loadFromDump(serial, idx);
            load = 'memory';
        };

        $scope.upload = function (file, idx) {
            memory[idx] = '';
            $scope['serial' + (idx + 1)] = '';
            $scope['serialDump' + (idx + 1)] = '';
            if (file) {
                uploadFromFile(file, idx);
                load = 'file';
            }
        };

        function uploadFromFile (file, idx) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                if (idx === 0) {
                    $scope.fileName1 = resp.config.data.file.name;
                } else {
                    $scope.fileName2 = resp.config.data.file.name;
                }
                Upload.base64DataUrl(file).then(function (url) {
                    Meteor.call('importEprom', url,
                        (err, data) => {
                            if (err) {
                                showError(err);
                            } else {
                                memory[idx] = data;
                            }
                            compare();
                        });
                });
            });
        }

        function loadFromPackout (serial, idx) {
            if (serial) {
                Meteor.call('getLastPackout', serial,
                    (err, data) => {
                        if (err) {
                            showError(err);
                        } else {
                            if (!data) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('No packout data for serial ' + serial)
                                        .position('bottom right')
                                        .hideDelay(3000));
                            }
                            memory[idx] = data.data.MemoryDump;
                        }
                        compare();
                    });
            }
        }

        function loadFromDump (serial, idx) {
            if (serial) {
                Meteor.call('getLastDump', serial,
                    (err, data) => {
                        if (err) {
                            showError(err);
                        } else {
                            if (!data) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('No memory dump data for serial ' + serial)
                                        .position('bottom right')
                                        .hideDelay(3000));
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
            for (let key in data1) {
                if (!data1.hasOwnProperty(key)) continue;
                let obj1 = data1[key];
                let obj2 = data2[key];
                if (obj1 && obj2) {
                    for (let i = 128; i < 256; i++) {
                        if (obj1.list[i] && obj2.list[i] &&
                            obj1.list[i].hex !== obj2.list[i].hex) {
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
            $scope.data2 = null;
        }
    }
]);
