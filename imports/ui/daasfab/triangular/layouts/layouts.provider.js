import angular from 'angular';

import './default/default-content.tmpl.html';
import '../components/notifications-panel/notifications-panel.tmpl.html';
import '../components/footer/footer.tmpl.html';
import '../components/toolbars/toolbar.tmpl.html';

angular.module('triangular').run(layoutRunner).provider('triLayout', layoutProvider);

layoutProvider.$inject = [];
layoutRunner.$inject = ['$rootScope', 'triLayout'];

/* @ngInject */
function layoutProvider() {
    let layoutDefaults = {
        toolbarSize: 'default',
        toolbarShrink: true,
        toolbarClass: '',
        contentClass: '',
        innerContentClass: '',
        sideMenuSize: 'full',
        showToolbar: true,
        footer: true,
        contentTemplateUrl: 'imports/ui/daasfab/triangular/layouts/default/default-content.tmpl.html',
        sidebarRightTemplateUrl: 'imports/ui/daasfab/triangular/components/notifications-panel/notifications-panel.tmpl.html',
        sidebarRightController: 'NotificationsPanelController',
        toolbarTemplateUrl: 'imports/ui/daasfab/triangular/components/toolbars/toolbar.tmpl.html',
        toolbarController: 'DefaultToolbarController',
        footerTemplateUrl: 'imports/ui/daasfab/triangular/components/footer/footer.tmpl.html'
    };
    let resetableOptions = ['toolbarSize', 'toolbarShrink', 'toolbarClass', 'contentClass', 'innerContentClass', 'sideMenuSize', 'showToolbar', 'footer', 'contentTemplateUrl', 'sidebarLeftTemplateUrl', 'sidebarLeftController', 'sidebarRightTemplateUrl', 'sidebarRightController', 'toolbarTemplateUrl', 'toolbarController', 'footerTemplateUrl', 'loaderTemplateUrl', 'loaderController'];
    let layout = {};

    this.getDefaultOption = getDefaultOption;
    this.setDefaultOption = setDefaultOption;

    function getDefaultOption(name) {
        return layoutDefaults[name];
    }

    function setDefaultOption(name, value) {
        layoutDefaults[name] = value;
    }

    // init

    angular.extend(layout, layoutDefaults);

    // Service
    this.$get = function () {
        function setOption(name, value) {
            layout[name] = value;
        }

        function updateLayoutFromState(event, toState) {
            // reset classes
            angular.forEach(resetableOptions, function (option) {
                layout[option] = layoutDefaults[option];
            });
            let layoutOverrides = angular.isDefined(toState.data) && angular.isDefined(toState.data.layout) ? toState.data.layout : {};
            angular.extend(layout, layout, layoutOverrides);
        }

        return {
            layout: layout,
            setOption: setOption,
            updateLayoutFromState: updateLayoutFromState
        };
    };
}

/* @ngInject */
function layoutRunner($rootScope, triLayout) {
    // check for $stateChangeStart and update the layouts if we have data.layout set
    // if nothing set reset to defaults for every state
    let destroyOn = $rootScope.$on('$stateChangeStart', triLayout.updateLayoutFromState);
    $rootScope.$on('$destroy', removeWatch);

    /////////////

    function removeWatch() {
        destroyOn();
    }
}

