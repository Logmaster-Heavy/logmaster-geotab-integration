
//change this when deploying to staging/prod
export const mainPartnerUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
export const contractDurationMongoId = '62bbcada9b8c495a93347323';
export const billingPeriodMongoId = '62bbcada9b8c495a93347319';

export const devBaseLogmasterURL = 'http://localhost:8080';
export const devBaseAPIURL = 'http://localhost:3005';

// export const prodBaseLogmasterURL = 'https://logmaster.au';
// export const prodBaseLogmasterAPIURL = 'https://prod-api.logmaster.au'

export const prodBaseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
export const prodBaseLogmasterAPIURL = 'https://logmaster-portal-navigation-z626q6mhla-ts.a.run.app'

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

export let mainBusinessContractDetails = {
  billingPeriodId: billingPeriodMongoId,
  businessMongoId: '',
  businessModulesDto: [],
  contractDurationId: contractDurationMongoId,
  contractDurationYears: 0,
  contractAccepted: true
};
export function setMainBusinessContractDetails(mainBusinessContractDetailsValue) {
  mainBusinessContractDetails = mainBusinessContractDetailsValue;
}
