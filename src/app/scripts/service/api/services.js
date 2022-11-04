import { devBaseAPIURL, devBaseLogmasterURL, prodBaseLogmasterAPIURL, prodBaseLogmasterURL } from '../../core/core-variables';


export function getBaseLogmasterURL () {
    if (global.environment === 'dev') {
        return devBaseLogmasterURL;
    }
    return prodBaseLogmasterURL;
};
export function getBaseLogmasterAPIURL () {
    if (global.environment === 'dev') {
        return devBaseAPIURL;
    }
    return prodBaseLogmasterAPIURL;
};