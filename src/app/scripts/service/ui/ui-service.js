import { cookieUidCname, finishCallback, logmasterK, mainLogmasterURI } from '../../core/core-variables';
import { getBaseLogmasterURL } from '../api/services';
import { getCookie } from '../utils/cookies-service';

export function displayLogmasterUILastStep() {
    console.log('baseLogmasterURL + mainLogmasterURI', getBaseLogmasterURL() + mainLogmasterURI);
    console.log('getCookie(cookieUidCname) last step', getCookie(cookieUidCname));
    changeIframeURI('last step');
    finishCallback();
};
export function changeIframeURI (source) {
    console.log('currentSRC updated to ', mainLogmasterURI);
    console.log('getCookie(cookieUidCname) ' + source, getCookie(cookieUidCname));
    let uriSplitted = mainLogmasterURI.split('/');

    //let geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab${mainLogmasterURI}/${encodeURIComponent(CryptoJS.AES.encrypt(getCookie(cookieUidCname), logmasterK).toString())}`
    let geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab`;
    //${mainLogmasterURI}/${encodeURIComponent(CryptoJS.AES.encrypt(getCookie(cookieUidCname), logmasterK).toString())}
    
    if(uriSplitted.length > 0){
        //always remove the 1st
        uriSplitted.shift();
        //append the first 2
        geotabLogmasterURL += `/${uriSplitted.shift()}`;
        if(uriSplitted.length > 0){
            geotabLogmasterURL += `/${uriSplitted.shift()}`;
        }
    }
    //append the accountId
    geotabLogmasterURL += `/${encodeURIComponent(CryptoJS.AES.encrypt(getCookie(cookieUidCname), logmasterK).toString())}`;

    //append remaining
    uriSplitted.forEach((value, index, arr) => {
        geotabLogmasterURL += `/${value}`;
    });
    document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL
}