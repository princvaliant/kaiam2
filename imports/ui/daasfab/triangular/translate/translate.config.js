import angular from 'angular';

angular.module('app.translate').config(translateConfig);

translateConfig.$inject = ['$translateProvider', '$translatePartialLoaderProvider', 'triSettingsProvider'];

/* @ngInject */
function translateConfig($translateProvider, $translatePartialLoaderProvider, triSettingsProvider) {
    var appLanguages = [{
        name: 'Chinese',
        key: 'zh'
    }, {
        name: 'English',
        key: 'en'
    }, {
        name: 'French',
        key: 'fr'
    }, {
        name: 'Portuguese',
        key: 'pt'
    }];

    /**
     *  each module loads its own translation file - making it easier to create translations
     *  also translations are not loaded when they aren't needed
     *  each module will have a i18n folder that will contain its translations
     */
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: '/i18n/{part}/{lang}.json'
    });

    $translatePartialLoaderProvider.addPart('app');

    // make sure all values used in translate are sanitized for security
    $translateProvider.useSanitizeValueStrategy('sanitize');

    // cache translation files to save load on server
    $translateProvider.useLoaderCache(true);

    // setup available languages in angular translate & triangular
    var angularTranslateLanguageKeys = [];
    for (var language in appLanguages) {
        // add language key to array for angular translate
        angularTranslateLanguageKeys.push(appLanguages[language].key);

        // tell triangular that we support this language
        triSettingsProvider.addLanguage({
            name: appLanguages[language].name,
            key: appLanguages[language].key
        });
    }

    /**
     *  try to detect the users language by checking the following
     *      navigator.language
     *      navigator.browserLanguage
     *      navigator.systemLanguage
     *      navigator.userLanguage
     */
    $translateProvider
        .registerAvailableLanguageKeys(angularTranslateLanguageKeys, {
            'en_US': 'en',
            'en_UK': 'en'
        })
        .use('en');

    // store the users language preference in a cookie
    $translateProvider.useLocalStorage();
}

