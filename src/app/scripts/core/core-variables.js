
//IMPORTANT
//START: change these when deploying to staging/prod
export const mainPartnerUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
export const contractDurationMongoId = '62bbcada9b8c495a93347323';
export const billingPeriodMongoId = '62bbcada9b8c495a93347319';

export const stagingMainPartnerUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
export const stagingContractDurationMongoId = '62bbcada9b8c495a93347323';
export const stagingBillingPeriodMongoId = '62bbcada9b8c495a93347319';

export const prodMainPartnerUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
export const prodContractDurationMongoId = '62bbcada9b8c495a93347323';
export const prodBillingPeriodMongoId = '62bbcada9b8c495a93347319';

export const devBaseLogmasterURL = 'http://localhost:8080';
export const devBaseAPIURL = 'http://localhost:3005';

// export const prodBaseLogmasterURL = 'https://logmaster.au';
// export const prodBaseLogmasterAPIURL = 'https://prod-api.logmaster.au'

export const prodBaseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
export const prodBaseLogmasterAPIURL = 'https://sandbox-api-au.logmaster.shop'
//END: change these when deploying to staging/prod

export const cookieUidCname = 'external-login-uid';

export const defaultPassword = 'Password1!';

export let mainLogmasterURI;
export function setMainLogmasterURI (mainLogmasterURIValue) {
  mainLogmasterURI = mainLogmasterURIValue;
}

export let api;
export function setAPI (apiValue) {
  api = apiValue;
}

export let loggedInUser;
export function setLoggedInUser (loggedInUserValue) {
  loggedInUser = loggedInUserValue;
}

export let mainParentAccessToken;
export function setMainParentAccessToken (mainParentAccessTokenValue) {
  mainParentAccessToken = mainParentAccessTokenValue;
}

export let mainPartnerDetails;
export function setMainPartnerDetails (mainPartnerDetailsValue) {
  mainPartnerDetails = mainPartnerDetailsValue;
}

export let childrenGroups;
export function setChildrenGroups (childrenGroupsValue) {
  childrenGroups = childrenGroupsValue;
};

export let loggedInUserVehicles;
export function setLoggedInUserVehicles (loggedInUserVehiclesValue) {
  loggedInUserVehicles = loggedInUserVehiclesValue;
}

export let finishCallback;
export function setFinishCallback (finishCallbackValue) {
  finishCallback = finishCallbackValue;
}

export let loggedInBusiness;
export function setLoggedInBusiness (loggedInBusinessValue) {
  loggedInBusiness = loggedInBusinessValue;
}

export let businessUID;
export function setBusinessUID (businessUIDValue) {
  businessUID = businessUIDValue
}

export let contractModuleMasters;
export function setContractModuleMasters (contractModuleMastersValue) {
  contractModuleMasters = contractModuleMastersValue
};

export let partnerRRP;
export function setPartnerRRP (partnerRRPValue) {
  partnerRRP = partnerRRPValue
}

export let businessContractMongoId;
export function setBusinessContractMongoId (businessContractMongoIdValue) {
  businessContractMongoId = businessContractMongoIdValue;
}