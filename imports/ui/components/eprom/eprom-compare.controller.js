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
    '$translate', '$translatePartialLoader', '$timeout',
    ($scope, $rootScope, $log, $state, $mdToast, $cookies, $meteor, $mdDialog, $location, $window,
     $translate, $translatePartialLoader, $timeout) => {
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
            min: 0,
            max: 63
        }, {
            min: 64,
            max: 127
        }, {
            min: 128,
            max: 191
        }, {
            min: 192,
            max: 255
        }];
        let memory = [0, 0];

        $scope.onSubmit = function (e) {
            e.preventDefault();
            memory[0] = '';
            memory[1] = '';
            packout($scope.serial1, 0);
            packout($scope.serial2, 1, compare);
        };

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
                        window.open('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' +  encodeURIComponent(data));
                    }
                });
        };

        function packout (serial, idx, compFunc) {
            if (!serial) {
                return;
            }
            Meteor.call('getLastPackout', serial,
                (err, data) => {
                    if (err) {
                        showError(err);
                    } else {
                        if (!data) {
                            showError('No packout data for serial ' + serial);
                        }
                        memory[idx] = data.data.MemoryDump;
                        if (compFunc) {
                            compFunc();
                        }
                    }
                });
        }

        function compare () {
            if (!memory[0] || !memory[1]) {
                showError('');
            }
            let data1 = pagify(memory[0]);
            let data2 = pagify(memory[1]);
            process(data1, data2);
            $scope.data1 = data1;
            $scope.data2 = data2;
            showPage();
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

        function pagify (memoryString) {
            let pages = {};
            _.each($scope.pages, (page) => {
                let pageData = memoryString.substring(page * 512, page * 512 + 512);
                pages[page] = {
                    diff: '',
                    list: _.map(pageData.match(/.{1,2}/g), (r) => {
                        return {diff: '',
                            val: String.fromCharCode(parseInt(r, 16)),
                            hex: r};
                    })
                };
            });
            return pages;
        }

        function process (data1, data2) {
            for (let key in data1) {
                if (!data1.hasOwnProperty(key)) continue;
                let obj1 = data1[key];
                let obj2 = data2[key];
                for (let i = 0; i < 256; i++) {
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
]);
