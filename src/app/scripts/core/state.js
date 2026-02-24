export const baseLogmasterURL = global.baseLogmasterURL;
export const baseAPIURL = global.baseAPIURL;

export const logmasterK = '41Od9TB4o02AVy';

export const cookieUidCname = 'external-login-uid';

export const cookieMainURICname = 'geotab-portal-v2-uri';

export let mainLogmasterURI;
export function setMainLogmasterURI(mainLogmasterURIValue) {
  mainLogmasterURI = mainLogmasterURIValue;
}

export let api;
export function setAPI(apiValue) {
  api = apiValue;
}

export let loggedInUser;
export function setLoggedInUser(loggedInUserValue) {
  loggedInUser = loggedInUserValue;
}

export let serverName;
export function setServerName(serverNameValue) {
  serverName = serverNameValue;
}

export let databaseName;
export function setDatabaseName(databaseNameValue) {
  databaseName = databaseNameValue;
}

export let companyGroups;
export function setCompanyGroups(companyGroupsValue) {
  companyGroups = companyGroupsValue;
}

export let childrenGroups;
export function setChildrenGroups(childrenGroupsValue) {
  childrenGroups = childrenGroupsValue;
}

export let finishCallback;
export function setFinishCallback(finishCallbackValue) {
  finishCallback = finishCallbackValue;
}