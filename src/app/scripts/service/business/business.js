import { METHODS } from '../../constants/method-constants';
import { billingPeriodMongoId, businessContractMongoId, businessUID, contractDurationMongoId, cookieUidCname, defaultPassword, loggedInBusiness, loggedInUser, mainParentAccessToken, partnerRRP, setBusinessContractMongoId, setBusinessUID, setLoggedInBusiness } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { getAllGeotabDrivers } from '../driver/driver';
import { getAllActiveRRP, getAllContractModuleMasters } from '../standard-pricing/business-standard-pricing';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getBusinessUIDFromWebProfile, startSyncingUsersToLogmaster } from '../user/user';
import { getAllGeotabVehicles } from '../vehicles/vehicles';


export function fetchPartnerRRP () {
    getAllActiveRRP(createBusinessFromGeotab);
};
export function createBusinessFromGeotab() {
    let businessName = loggedInUser.firstName;
    if(loggedInUser.lastName != ''){
        businessName += ' ' + loggedInUser.lastName;
    }
    let businessDetails = {
        businessModules: partnerRRP,
        persona: {
            businessName: businessName.trim(),
            abn: '12341234',
            businessAddress: loggedInUser.authorityAddress.trim(),
            contactUserName: businessName.trim(),
            contactEmail: loggedInUser.name.trim(),
            contactPhoneNumber: loggedInUser.phoneNumber.trim()
        },
        supportEmail: loggedInUser.name.trim(),
        isActive: true,
        demoOption: 'NO_DEMO',
        externalSiteId: loggedInUser.id.trim()
    };
    console.log('business-body', businessDetails);
    let onLoadFunc = function () {
        if (this.status == 201) {
            console.log('business created');
            setLoggedInBusiness(this.response.data);
            createBusinessContract();
        } else {
            console.log('error in business create', this.response);
            displayLogmasterUILastStep();
        }
    };
    let onErrorFunc = function () {
        // handle non-HTTP error (e.g. network down)
        console.log('non http error', this.response);
        displayLogmasterUILastStep()
    };
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business',
        onLoadFunc,
        onErrorFunc,
        mainParentAccessToken)
        .send(JSON.stringify(businessDetails).trim());
};
export function createBusinessContract() {
    let mainBusinessContractDetails = {
        billingPeriodId: billingPeriodMongoId,
        businessMongoId: loggedInBusiness._id,
        businessModulesDto: partnerRRP,
        contractDurationId: contractDurationMongoId,
        contractDurationYears: 0
    };
    console.log('business contract', mainBusinessContractDetails);
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business-contract/business-contract',
        function () {
            //on load
            setBusinessContractMongoId(this.response.data._id);
            console.log('business default contract created sucessfully', businessContractMongoId);
            acceptBusinessContract();
        },
        function () {
            //on error
            console.log('error on create business contract', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send(JSON.stringify(mainBusinessContractDetails));
};
export function acceptBusinessContract() {
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business-contract/accept/' + businessContractMongoId,
        function () {
            //onload
            console.log('business contract accepted');
            createBussinesPassword();
        },
        function () {
            //on error
            console.log('error on accept business contract', this.response);
            displayLogmasterUILastStep();
        })
        .send(JSON.stringify({
            remarks: 'Auto-approved'
        }));
};
export function updateLogmasterDataWithGeoTab() {
    loggedInBusiness['externalSiteId'] = loggedInUser.id;
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/' + loggedInBusiness._id,
        function () {
            // onload
            console.log('business external id updated from geotab');
            checkBusinessEmailAlreadyExists();
        },
        function () {
            // on error
            console.log('error update business external id', this.response);
        },
        mainParentAccessToken)
        .send(JSON.stringify(loggedInBusiness));
};
export function checkBusinessEmailAlreadyExists() {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email',
        function () {
            //on load
            console.log('checking business existence', this.response);
            if (this.response.success) {
                setLoggedInBusiness(this.response.data);
                console.log('business already created', loggedInBusiness);
                if (loggedInBusiness.externalSiteId) {
                    //geotab already synced
                    //asynchronously sync vehicles
                    getAllGeotabVehicles();
                    //async sync driver
                    getAllGeotabDrivers();
                    getBusinessUIDFromWebProfile(loggedInBusiness);
                    //async sync all users that are not drivers after setting
                    startSyncingUsersToLogmaster();
                } else {
                    //update logmaster with geotab specific data
                    updateLogmasterDataWithGeoTab();
                }
                /**
                 * Set cookie business.uid 
                 * name of cookie: external-login-uid
                 * sa portal-v2 page, kukunin yung cookie na yun, para auto login
                 * tapos redirect sa bagong page ex: Business -> Driver page
                 * yung laman ng Business driver page are Drivers under sa nakalogin na user
                 * update Readme
                 */
            } else {
                getAllContractModuleMasters(fetchPartnerRRP);
            }
        },
        function () {

        },
        mainParentAccessToken)
        .send(JSON.stringify({
            emailAddress: loggedInUser.name
        }));
};
export function createBussinesPassword() {
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
            displayLogmasterUILastStep();
        })
        .send(JSON.stringify(passwordPayload));
}