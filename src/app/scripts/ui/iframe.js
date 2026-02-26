import {
  baseLogmasterURL,
  databaseName,
  finishCallback,
  mainLogmasterURI,
  selectedOrgUser,
} from '../core/state';

export function displayLogmasterUILastStep() {
  renderIframe();
  finishCallback();
}

export function renderIframe() {
  const uriSplitted = mainLogmasterURI.split('/');
  let geotabLogmasterURL = `${baseLogmasterURL}/geotab`;

  if (uriSplitted.length > 0) {
    uriSplitted.shift();
    geotabLogmasterURL += `/${uriSplitted.shift()}`;
    if (uriSplitted.length > 0) {
      geotabLogmasterURL += `/${uriSplitted.shift()}`;
    }
  }
  const messagePayload = `${selectedOrgUser && selectedOrgUser._id || ''}`;
  geotabLogmasterURL += `/${messagePayload}`;

  uriSplitted.forEach((value) => {
    geotabLogmasterURL += `/${value}`;
  });
  document.getElementById('logmaster-main-iframe').src = geotabLogmasterURL;
}
