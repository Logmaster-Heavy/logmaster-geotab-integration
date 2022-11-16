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
    const geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab${mainLogmasterURI}/${encodeURIComponent(CryptoJS.AES.encrypt(getCookie(cookieUidCname), logmasterK).toString())}`
    document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL
}