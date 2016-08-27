'use strict';

import angular from 'angular';
import './sces.controller';
import './sces.tmpl.html';
import './sces-ship.controller';
import './sces-ship.tmpl.html';
import './sces-order.controller';
import './sces-order.tmpl.html';
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
            $stateProvider.state ('triangular.sces.shipment', {
                url: '/shipment?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-ship.tmpl.html',
                        controller: 'ScesShipController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.salesOrder', {
                url: '/salesOrder?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-order.tmpl.html',
                        controller: 'ScesOrderController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.tray', {
                url: '/tray?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-tray.tmpl.html',
                        controller: 'ScesTrayController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.batchrequest', {
                url: '/batchrequest?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-batchrequest.tmpl.html',
                        controller: 'ScesBatchRequestController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.rma', {
                url: '/rma?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-rma.tmpl.html',
                        controller: 'ScesRmaController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.tab', {
                url: '/tabs',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-tab.tmpl.html',
                        controller: 'ScesTabController'
                    }
                }
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

            $stateProvider.state ('triangular.sces.transceiver', {
                url: '/transceiver?id=',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-transceiver.tmpl.html',
                        controller: 'ScesTransceiverController'
                    }
                }
            });
            $stateProvider.state ('triangular.sces.scan', {
                url: '/scan',
                views: {
                    'contentsces': {
                        templateUrl: 'imports/ui/components/sces/sces-scan.tmpl.html',
                        controller: 'ScesScanController'
                    }
                }
            });
        }
    ]);
