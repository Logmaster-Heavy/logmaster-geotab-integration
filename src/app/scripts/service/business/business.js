import { METHODS } from '../../constants/method-constants';
import { businessUID, cookieUidCname, defaultPassword, loggedInBusiness, loggedInUser, mainParentAccessToken, setBusinessUID, setLoggedInBusiness } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getCookie, setCookie } from '../utils/cookies-service';


export function createBusinessFromGeotab() {
    let businessName = loggedInUser.firstName + ' ' + loggedInUser.lastName;
    let businessDetails = {
        persona: {
            businessName: businessName.trim(),
            abn: '12341234',
            businessAddress: loggedInUser.authorityAddress.trim(),
            contactUserName: loggedInUser.name.trim(),
            contactEmail: loggedInUser.name.trim(),
            contactPhoneNumber: loggedInUser.phoneNumber.trim()
        },
        supportEmail: loggedInUser.name.trim(),
        isActive: true,
        demoOption: 'NO_DEMO',
        externalBusinessId: loggedInUser.id.trim()
    };
    console.log('business-body', businessDetails);
    let onLoadFunc = function () {
        if (this.status == 201) {
            console.log('business created');
            setLoggedInBusiness(this.response.data);
            createBusinesPassword();
        } else {
            console.log('error in business create', this.response);
            displayLogmasterUILastStep();
        }
    };
    let onErrorFunc = function () {
        // handle non-HTTP error (e.g. network down)
        console.log('non http error', this.response);
        errorCallback();
    };
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business',
        onLoadFunc,
        onErrorFunc,
        mainParentAccessToken)
        .send(JSON.stringify(businessDetails).trim());
};
export function checkBusinessEmailAlreadyExists() {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email',
        function () {
            //on load
            console.log('checking business existence', this.response);
            if (this.response.success) {
                setLoggedInBusiness(this.response.data);
                console.log('business already created', loggedInBusiness);
                getBusinessUIDFromWebProfile();
                /**
                 * Set cookie business.uid 
                 * name of cookie: external-login-uid
                 * sa portal-v2 page, kukunin yung cookie na yun, para auto login
                 * tapos redirect sa bagong page ex: Business -> Driver page
                 * yung laman ng Business driver page are Drivers under sa nakalogin na user
                 * update Readme
                 */
                displayLogmasterUILastStep();
            } else {
                createBusinessFromGeotab();
            }
        },
        function () {

        },
        mainParentAccessToken)
        .send(JSON.stringify({
            emailAddress: loggedInUser.name
        }));
};
export function createBusinesPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/create-password/' + loggedInBusiness._id,
        function () {
            //onload
            console.log('password created');
            checkBusinessEmailAlreadyExists();
        },
        function () {
            console.log('error create password', this.response);
            errorCallback();
        })
        .send(JSON.stringify(passwordPayload));
};
export function getBusinessUIDFromWebProfile () {
    let mainWebProfile = loggedInBusiness.webProfiles.find(function (profile) {
        return profile.isRoot == true;
    });
    if(mainWebProfile) {
        setBusinessUID(mainWebProfile.uid);
        console.log('businessUID', businessUID);
        let existingCookie = getCookie(cookieUidCname);
        console.log('existingCookie', existingCookie);
        if(!existingCookie){
            setCookie(cookieUidCname, businessUID);
            console.log('cookie set', getCookie(cookieUidCname));
        }
    }
}