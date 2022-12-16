/**
 * This is the entry point for your app
 * Include any assets to be bundled in here
 * (css/images/js/etc)
 */
// console.log = function() {}
global.environment = 'production';
global.baseLogmasterURL = 'https://logmaster.au';
global.baseAPIURL = 'https://prod-api.logmaster.au';
global.mainPartnerUID = 'NLDvYreN2bUTOKcRSJPSKnFtHJX2';
global.mainBusinessParentUID = '1EisNqacnIgQuHMaRNtUwDjjyH83';
global.contractDurationMongoId = '62c1c30c7db5cd6fb8a7e7ef';
global.billingPeriodMongoId = '62c1c30b7db5cd6fb8a7e7e9';
global.businessParentOfDriverMongoId = '62e325af331dfc140368ec9f';

// Allowing babel to work with older versions of IE
const regeneratorRuntime = require('regenerator-runtime');

if(!geotab.addin.logmasterEwd2){
    
    require('./scripts/main');

}

require('./styles/main.css');
