import { cookieUidCname, finishCallback, logmasterK, mainLogmasterURI } from '../../core/core-variables';
import { getBaseLogmasterURL } from '../api/services';
import { getCookie } from '../utils/cookies-service';

export function displayLogmasterUILastStep() {
    changeIframeURI('last step');
    finishCallback();
};
export function changeIframeURI (source) {
    let uriSplitted = mainLogmasterURI.split('/');
    let geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab`;
    
    if(uriSplitted.length > 0){
        //Removes empty string
        uriSplitted.shift();
        geotabLogmasterURL += `/${uriSplitted.shift()}`;
        if(uriSplitted.length > 0){
            geotabLogmasterURL += `/${uriSplitted.shift()}`;
        }
    }
    const targetUidFromCookie = getCookie(cookieUidCname);
    console.log('targetUidFromCookie: (changeIframeURI)', targetUidFromCookie);
    //append the accountId
    geotabLogmasterURL += `/${encodeURIComponent(CryptoJS.AES.encrypt(targetUidFromCookie, logmasterK).toString())}`;

    //append remaining
    uriSplitted.forEach((value, index, arr) => {
        geotabLogmasterURL += `/${value}`;
    });
    console.log('geotabLogmasterURL: ', geotabLogmasterURL);
    document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL
}