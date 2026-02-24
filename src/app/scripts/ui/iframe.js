import {
  cookieUidCname,
  finishCallback,
  logmasterK,
  mainLogmasterURI,
} from '../core/state';
import { getBaseLogmasterURL } from '../api/endpoints';
import { getCookie } from '../utils/cookies';

export function displayLogmasterUILastStep() {
  changeIframeURI();
  finishCallback();
}

export function changeIframeURI() {
  const uriSplitted = mainLogmasterURI.split('/');
  let geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab`;

  if (uriSplitted.length > 0) {
    uriSplitted.shift();
    geotabLogmasterURL += `/${uriSplitted.shift()}`;
    if (uriSplitted.length > 0) {
      geotabLogmasterURL += `/${uriSplitted.shift()}`;
    }
  }
  const targetUidFromCookie = getCookie(cookieUidCname);
  geotabLogmasterURL += `/${encodeURIComponent(CryptoJS.AES.encrypt(targetUidFromCookie, logmasterK).toString())}`;

  uriSplitted.forEach((value) => {
    geotabLogmasterURL += `/${value}`;
  });
  document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL;
}
