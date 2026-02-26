export const baseLogmasterURL = global.baseLogmasterURL;
export const baseAPIURL = global.baseAPIURL;

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

export let finishCallback;
export function setFinishCallback(finishCallbackValue) {
  finishCallback = finishCallbackValue;
}

export let selectedOrgUser;
export function setSelectedOrgUser(selectedOrgUserValue) {
  selectedOrgUser = selectedOrgUserValue;
}