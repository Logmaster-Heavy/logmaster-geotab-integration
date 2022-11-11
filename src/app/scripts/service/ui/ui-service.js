import { cookieUidCname, finishCallback, logmasterK, mainLogmasterURI } from '../../core/core-variables';
import { getBaseLogmasterURL } from '../api/services';
import { getCookie } from '../utils/cookies-service';

export function displayLogmasterUILastStep() {
    console.log('baseLogmasterURL + mainLogmasterURI', getBaseLogmasterURL() + mainLogmasterURI);
    document.getElementById('logmaster-main-iframe').src = getBaseLogmasterURL() + mainLogmasterURI + '?' + cookieUidCname + '=' + CryptoJS.AES.encrypt(getCookie(cookieUidCname), logmasterK).toString();
    finishCallback();
};