import {
  finishCallback,
  mainLogmasterURI,
  selectedOrgUser,
} from '../core/state';
import { getBaseLogmasterURL } from '../api/endpoints';

export function displayLogmasterUILastStep() {
  renderIframe();
  finishCallback();
}

export function renderIframe() {
  const uriSplitted = mainLogmasterURI.split('/');
  let geotabLogmasterURL = `${getBaseLogmasterURL()}/geotab`;

  if (uriSplitted.length > 0) {
    uriSplitted.shift();
    geotabLogmasterURL += `/${uriSplitted.shift()}`;
    if (uriSplitted.length > 0) {
      geotabLogmasterURL += `/${uriSplitted.shift()}`;
    }
  }
  geotabLogmasterURL += `/${selectedOrgUser && selectedOrgUser._id || ''}`;

  uriSplitted.forEach((value) => {
    geotabLogmasterURL += `/${value}`;
  });
  document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL;
}
