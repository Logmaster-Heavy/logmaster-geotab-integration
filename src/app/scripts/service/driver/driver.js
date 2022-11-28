import { METHODS, STATES } from '../../constants/method-constants';
import { api, businessParentOfDriverMongoId, businessRole, businessUID, companyGroups, connectedDrivers, defaultPassword, loggedInBusiness, loggedInDriver, loggedInUser, mainParentAccessToken, setConnectedDrivers, setLoggedInDriver } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getBusinessUIDFromWebProfile } from '../user/user';

export function generateDriverDetails (user, parentExternalSiteId) {
    let driverName = user.firstName.trim();
    // let dateToday = new Date();
    // if (user.lastName != '') {
    //     driverName += ' ' + user.lastName.trim();
    // }
    let driverDetails = {
        driversLicenseState: STATES[user.licenseProvince.trim().toLowerCase()],
        emailAddress: user.name.trim(),
        driverName: driverName,
        driverDateOfBirth: null,
        driversLicenseNumber: user.licenseNumber.trim(),
        driversLicenseExpiry: (dateToday.getFullYear() + 10) + '-' + dateToday.getMonth() + '-' + dateToday.getDate(),
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

export function createDriverFromGeotab() {
    let driverDetails = generateDriverDetails(loggedInUser);
    console.log('driver details', driverDetails);
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver',
        function () {
            //on load
            if(this.response.success){
                setLoggedInDriver(this.response.data)
                console.log('driver created', loggedInDriver);
                createDriverPassword();
            } else {
                console.log('error creating driver', this.response);
                displayLogmasterUILastStep();
            }
        },
        function () {
            //on error
            console.log('error creating driver', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send(JSON.stringify(driverDetails));
}
export function updateLogmasterDataWithGeoTab() {
    loggedInDriver['externalSiteId'] = loggedInUser.id;
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/' + loggedInDriver._id,
        function () {
            // onload
            console.log('driver external id updated from geotab');
            checkDriverEmailAlreadyExists();
        },
        function () {
            // on error
            console.log('error update driver external id', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send(JSON.stringify(loggedInDriver));
}
export function checkDriverEmailAlreadyExists() {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/find-by-email',
        function () {
            //on load
            console.log('checking driver existence', this.response);
            if (this.response.success) {
                setLoggedInDriver(this.response.data);
                console.log('driver already exists', loggedInDriver);
                if (loggedInDriver.externalSiteId) {
                    //geotab already synced
                    console.log('already sync to geotab');
                    getBusinessUIDFromWebProfile(loggedInDriver);
                } else {
                    updateLogmasterDataWithGeoTab();
                }
            } else {
                console.log('solo driver not yet created', this.response);
                createDriverFromGeotab();
            }
        },
        function () {
            //on error
            console.log('error http driver check', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send(JSON.stringify({ emailAddress: loggedInUser.name }));
}
export function createDriverPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/solo-driver/create-password/' + loggedInDriver._id,
        function () {
            //onload
            console.log('password created');
            checkDriverEmailAlreadyExists();
        },
        function () {
            console.log('error create password', this.response);
            displayLogmasterUILastStep();
        })
        .send(JSON.stringify(passwordPayload));
}

export function syncAllGeotabDriversToLogmaster() {
    console.log('start syncing drivers to logmaster')
    ajaxInit (METHODS.POST, getBaseLogmasterAPIURL() + '/solo-driver/create-multiple', 
        function () {
            //onload
            console.log(this.response.message);
        },
        function () {
            //onerror
            console.log('error syncing solo drivers to logmaster', this.response);
        },
        mainParentAccessToken)
        .send(JSON.stringify(connectedDrivers));
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