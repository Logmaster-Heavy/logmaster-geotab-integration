import { finishCallback, mainLogmasterURI } from '../../core/core-variables';
import { getBaseLogmasterURL } from '../api/services';

export function displayLogmasterUILastStep() {
    console.log('baseLogmasterURL + mainLogmasterURI', getBaseLogmasterURL() + mainLogmasterURI);
    document.getElementById('logmaster-main-iframe').src = getBaseLogmasterURL() + mainLogmasterURI;
    finishCallback();
};