import { METHODS, STATES } from '../../constants/method-constants';
import { businessParentOfDriverMongoId, defaultPassword, loggedInDriver, loggedInUser, mainParentAccessToken, setLoggedInDriver } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getBusinessUIDFromWebProfile } from '../user/user';

export function createDriverFromGeotab() {
    let driverName = loggedInUser.firstName.trim();
    let dateToday = new Date();
    if (loggedInUser.lastName != '') {
        driverName += ' ' + loggedInUser.lastName.trim();
    }
    let driverDetails = {
        driversLicenseState: STATES[loggedInUser.licenseProvince.trim().toLowerCase()],
        emailAddress: loggedInUser.name.trim(),
        driverName: driverName,
        driverDateOfBirth: dateToday.getFullYear() + '-' + dateToday.getMonth() + '-' + dateToday.getDate(),
        driversLicenseNumber: loggedInUser.licenseNumber.trim(),
        driversLicenseExpiry: (dateToday.getFullYear() + 10) + '-' + dateToday.getMonth() + '-' + dateToday.getDate(),
        entityId: businessParentOfDriverMongoId,
        isDemoAccount: false,
        demoOption: 'NO_DEMO',
        externalSiteId: loggedInUser.id.trim()
    };
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