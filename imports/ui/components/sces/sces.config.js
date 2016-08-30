'use strict';

import angular from 'angular';
import './sces.controller';
import './sces.tmpl.html';
import './sces-shipment.controller';
import './sces-shipment.tmpl.html';
import './sces-salesorder.controller';
import './sces-salesorder.tmpl.html';
import './sces-tray.controller';
import './sces-tray.tmpl.html';
import './sces-transceiver.controller';
import './sces-transceiver.tmpl.html';
import './sces-batchrequest.controller';
import './sces-batchrequest.tmpl.html';
import './sces-rma.controller';
import './sces-rma.tmpl.html';
import './sces-tab.controller';
import './sces-tab.tmpl.html';
import './sces-table.controller';
import './sces-table.tmpl.html';
import './sces-scan.controller';
import './sces-scan.tmpl.html';

/**
 * @ngdoc module
 * @name kaiamSces
 * @description Supply Chain Execution System
 */
angular.module ('kaiamSces')
    .config (['$translatePartialLoaderProvider', '$stateProvider',
        function ($translatePartialLoaderProvider, $stateProvider) {
            $translatePartialLoaderProvider.addPart ('sces');
            $stateProvider.state ('triangular.sces', {
                abstract: true,
                url: '/sces',
                templateUrl: 'imports/ui/components/sces/sces.tmpl.html',
                controller: 'ScesController'
            });
            $stateProvider.state ('triangular.sces.tab', {
                url: '/tab',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-tab.tmpl.html',
                        controller: 'ScesTabController'
                    }
                }
            });

            $stateProvider.state ('triangular.sces.scan', {
                url: '/scan?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-scan.tmpl.html',
                        controller: 'ScesScanController'
                    }
                }
            });

            _.each (_.keys(ScesSettings.columns), (o) => {
                let cname = o.toLowerCase().charAt(0).toUpperCase() + o.toLowerCase().slice(1);
                $stateProvider.state ('triangular.sces.' + o.toLowerCase(), {
                    url: '/' + o.toLowerCase() + '?id=',
                    views: {
                        'contentsces': {
                            templateUrl: 'imports/ui/components/sces/sces-' +  o.toLowerCase() + '.tmpl.html',
                            controller: 'Sces' + cname + 'Controller'
                        }
                    }
                });
            });

            _.each (_.keys(ScesSettings.columns), (o) => {
                $stateProvider.state ('triangular.sces.tab.' + o.toLowerCase(), {
                    url: '/' + o.toLowerCase(),
                    views: {
                        'contentscestables': {
                            templateUrl: 'imports/ui/components/sces/sces-table.tmpl.html',
                            controller: 'ScesTableController'
                        }
                    },
                    params: {
                        'domain': o
                    }
                });
            });
        }
    ]);
