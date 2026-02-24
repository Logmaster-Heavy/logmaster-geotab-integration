/**
 * This is the entry point for your app
 * Include any assets to be bundled in here
 * (css/images/js/etc)
 */
// console.log = function() {}
global.environment = 'production';
global.baseLogmasterURL = 'https://logmaster.au';
global.baseAPIURL = 'https://prod-api.logmaster.au';

// Allowing babel to work with older versions of IE
require('regenerator-runtime');

if(!geotab.addin.logmasterEwd2){
    
    require('./scripts/main');

}

require('./styles/main.css');
