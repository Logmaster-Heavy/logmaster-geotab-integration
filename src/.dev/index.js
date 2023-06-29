/**
 * Entry point for serving the app on localhost
 * Allows several UI features to be displayed to improve
 * development without adding them in to the final
 * build sent to production
 * 
 * ******************** NOTE ********************
 * 
 *  Any features built into this file will not be included in
 * the addin build. Any changes you want included should be in
 * app/index.js instead.
 * 
 * **********************************************
 */


// Global object is used to simulate the api, state, and geotab objects
global.api
global.state = require('./state');
global.geotab = {
    addin: {}, 
    customButtons: {}, 
    isDriveAddin: false
}
// Importing the app rules -> Where addin will be described

global.environment = 'production';
global.baseLogmasterURL = 'https://logmaster.au';
global.baseAPIURL = 'https://prod-api.logmaster.au';
global.mainPartnerUID = 'NLDvYreN2bUTOKcRSJPSKnFtHJX2';
global.mainBusinessParentUID = '1EisNqacnIgQuHMaRNtUwDjjyH83';
global.contractDurationMongoId = '62c1c30c7db5cd6fb8a7e7ef';
global.billingPeriodMongoId = '62c1c30b7db5cd6fb8a7e7e9';
global.businessParentOfDriverMongoId = '62e325af331dfc140368ec9f';


require('../app/scripts/main');

// Importing dev-specific packages
import './rison';
import './login/loginTemplate.js';
import GeotabLogin from './login/loginLogic';
import GeotabApi from './api';

// Building navbar
// Exposing handler to let the translate function have access to it
import './navbar/NavBuilder';

/* Translations */
import Translator from './lang/Translator';
let language = localStorage.language ? localStorage.language : 'en';
global.translator = new Translator('#app', language);

// Global Translate function
global.state.translate = function(target, language) {
    
    // First translation from initialize doesn't pass a language in. Will cause problems is language is undefined
    if (typeof language !== 'undefined'){
        localStorage.language = language;
        location.reload();
    }

    // Primary behaviour passes HTMLElement, but function needs to support string translation as well
    if (typeof target === 'string'){
        // Do translation
        let translation = global.translator.translateSentence(target);
        // return translated string
        return translation;
    }
}

/* Logic */
const loginLogic = new GeotabLogin(global.geotab.isDriveAddin, GeotabApi);


// Building translation hierarchy
require('./lang/languages');

/* Group Filter Module */
import GroupListeners from './groups/GroupListeners.js';
let groupListener = new GroupListeners(global.api, global.state, 'group-dropdown');
groupListener.assignEventListeners();


// Handling the blur toggle
require('./ToggleHandler');


// Setting up mock display panel
// let mainPanel = document.querySelector('#app');
// mainPanel.id = 'checkmateContent';
// mainPanel.className = 'centerPane';
// mainPanel.style.top = '40px';
// mainPanel.style.left = '250px';

// Setup complete
/* Addin Logic */
require('../app/index');
