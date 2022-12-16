import { async } from 'regenerator-runtime';
import { METHODS, STATES } from '../../constants/method-constants';
import { api, businessParentOfDriverMongoId, businessRole, businessUID, companyGroups, connectedDrivers, defaultPassword, loggedInBusiness, loggedInDriver, loggedInUser, mainParentAccessToken, setConnectedDrivers, setLoggedInDriver } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getBusinessUIDFromWebProfile } from '../user/user';

export function generateDriverDetails (user, parentExternalSiteId) {
    let driverName = user.firstName.trim();
    let driverDetails = {
        driversLicenseState: STATES[user.licenseProvince.trim().toLowerCase()],
        emailAddress: user.name.trim(),
        driverName: driverName,
        driverDateOfBirth: null,
        driversLicenseNumber: user.licenseNumber.trim(),
        driversLicenseExpiry: null,
        entityId: businessParentOfDriverMongoId,
        isDemoAccount: false,
        demoOption: 'NO_DEMO',
        externalSiteId: user.id.trim()
    };
    if(parentExternalSiteId){
        driverDetails.parentUid = businessUID;
        driverDetails.parentRole = businessRole;
        driverDetails.parentExternalSiteId = parentExternalSiteId;
        driverDetails.isFromExternal = true;
    }
    return driverDetails;
}

export async function createDriverFromGeotab() {
    let driverDetails = generateDriverDetails(loggedInUser);
    console.log('driver details', driverDetails);
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver', driverDetails, mainParentAccessToken);
        if(response.success){
            setLoggedInDriver(response.data)
            console.log('driver created', loggedInDriver);
            createDriverPassword();
        } else {
            console.log('error creating driver', response);
            displayLogmasterUILastStep();
        }
    } catch (error) {
        console.log('error creating driver', error);
        displayLogmasterUILastStep();
    }
}
export async function updateLogmasterDataWithGeoTab() {
    loggedInDriver['externalSiteId'] = loggedInUser.id;
    try {
        let response = await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/' + loggedInDriver._id, loggedInDriver, mainParentAccessToken);
        console.log('driver external id updated from geotab');
        checkDriverEmailAlreadyExists();   
    } catch (error) {
        console.log('error update driver external id', error);
    }
}
export async function checkDriverEmailAlreadyExists() {
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/find-by-email', { emailAddress: loggedInUser.name }, mainParentAccessToken);
        console.log('checking driver existence', response);
        if (response.success) {
            setLoggedInDriver(response.data);
            console.log('driver already exists', loggedInDriver);
            if (loggedInDriver.externalSiteId) {
                //geotab already synced
                console.log('already sync to geotab');
                getBusinessUIDFromWebProfile(loggedInDriver);
            } else {
                await updateLogmasterDataWithGeoTab();
            }
        } else {
            console.log('solo driver not yet created', response);
            createDriverFromGeotab();
        }
    } catch (error) {
        console.log('error http driver check', error);
        displayLogmasterUILastStep();
    }
}
export async function createDriverPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    try {
        let response = await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/create-password/' + loggedInDriver._id, passwordPayload);
        console.log('password created');
        checkDriverEmailAlreadyExists();
    } catch (error) {   
        console.log('error create password', this.response);
        displayLogmasterUILastStep();
    }
}

export async function syncAllGeotabDriversToLogmaster() {
    console.log('start syncing drivers to logmaster');
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/create-multiple', connectedDrivers, mainParentAccessToken);
        console.log(response.message);   
    } catch (error) {
        console.log('error syncing solo drivers to logmaster', error);
    }
};

export function getAllGeotabDrivers() {
    api.call('Get', {
        typeName: 'User',
        search: {
            companyGroups: companyGroups,
            isDriver: true
        }
    }, function (fetchedDrivers) {
        console.log('fetchedDrivers', fetchedDrivers);
        setConnectedDrivers(fetchedDrivers.map (function (driver)  {
            return generateDriverDetails(driver, loggedInUser.id);
        }));
        console.log('connectedDrivers', connectedDrivers);
        syncAllGeotabDriversToLogmaster();
        //callbackFunction();
    }, function (err) {
        console.log('error in driver fetch', err);
    });
};