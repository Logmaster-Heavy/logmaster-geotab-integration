/**
 * This is the entry point for your app
 * Include any assets to be bundled in here
 * (css/images/js/etc)
 */

global.environment = 'dev';
global.baseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
global.baseAPIURL = 'https://sandbox-api-au.logmaster.shop';
global.mainPartnerUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
global.mainBusinessParentUID = 'XeqTkJ5VUnWFYWK7bKWXeQ58yLF3';
global.contractDurationMongoId = '62bbcada9b8c495a93347323';
global.billingPeriodMongoId = '62bbcada9b8c495a93347319';
global.businessParentOfDriverMongoId = '624f0935f07b702b6d33e9a6';

// Allowing babel to work with older versions of IE
const regeneratorRuntime = require('regenerator-runtime');

if(!geotab.addin.logmasterEwd2){
    
    require('../app/scripts/main');
    
}

require('../app/styles/main.css');
