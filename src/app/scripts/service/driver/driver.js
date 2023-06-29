import { METHODS, STATES } from '../../constants/method-constants';
import { api, businessParentOfDriverMongoId, businessRole, businessUID, companyGroups, connectedDrivers, defaultPassword, loggedInDriver, loggedInUser, mainParentAccessToken, setConnectedDrivers, setLoggedInDriver } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getUIDFromWebProfile } from '../user/user';

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
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver', driverDetails, mainParentAccessToken);
        if(response.success){
            setLoggedInDriver(response.data)
            createDriverPassword();
        } else {
            console.log('createDriverFromGeotab: error creating driver', response);
            displayLogmasterUILastStep();
        }
    } catch (error) {
        console.log('error creating driver', error);
        displayLogmasterUILastStep();
    }
}
export async function updateExternalSiteIdLogmaster() {
    loggedInDriver['externalSiteId'] = loggedInUser.id;
    try {
        await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/' + loggedInDriver._id, loggedInDriver, mainParentAccessToken);;
        await checkDriverExistenceAndCreateDriver();
    } catch (error) {
        console.log('updateExternalSiteIdLogmaster: error update driver external id', error);
    }
}
export async function checkDriverExistenceAndCreateDriver() {
    try {
        const response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/find-by-email', { emailAddress: loggedInUser.name }, mainParentAccessToken);
        // Driver exists
        if (response.success) {
            setLoggedInDriver(response.data);

            if (loggedInDriver.externalSiteId) {
                getUIDFromWebProfile(loggedInDriver);
            } else {
                await updateExternalSiteIdLogmaster();
            }
        } else {
            console.log('solo driver not yet created')
            createDriverFromGeotab();
        }
    } catch (error) {
        console.log('checkDriverExistenceAndCreateDriver: error http driver check', error);
        displayLogmasterUILastStep();
    }
}
export async function createDriverPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    try {
        await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/create-password/' + loggedInDriver._id, passwordPayload);
        await checkDriverExistenceAndCreateDriver();
    } catch (error) {   
        console.log('error create password', this.response);
        displayLogmasterUILastStep();
    }
}

export function syncGeotabDriversToLogmaster() {
    api.call('Get', {
        typeName: 'User',
        search: {
            companyGroups: companyGroups,
            isDriver: true
        }
    }, async function (fetchedDrivers) {
        setConnectedDrivers(fetchedDrivers.map (function (driver)  {
            return generateDriverDetails(driver, loggedInUser.id);
        }));
        try {
            await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/create-multiple', connectedDrivers, mainParentAccessToken);
            console.log('drivers sync completed');
        } catch (error) {
            console.log('syncGeotabDriversToLogmaster: error syncing solo drivers to logmaster', error);
        }
    }, function (err) {
        console.log('error in driver fetch', err);
    });
};