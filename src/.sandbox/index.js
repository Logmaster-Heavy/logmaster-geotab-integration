/**
 * This is the entry point for your app
 * Include any assets to be bundled in here
 * (css/images/js/etc)
 */

global.environment = 'dev';
global.baseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
global.baseAPIURL = 'https://sandbox-api-au.logmaster.shop';

// Allowing babel to work with older versions of IE
require('regenerator-runtime');

if(!geotab.addin.logmasterEwd2){
    
    require('../app/scripts/main');
    
}

require('../app/styles/main.css');
