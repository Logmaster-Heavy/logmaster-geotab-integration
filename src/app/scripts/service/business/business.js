import { METHODS } from '../../constants/method-constants';
import { billingPeriodMongoId, businessContractMongoId, businessUID, contractDurationMongoId, cookieUidCname, defaultPassword, loggedInBusiness, loggedInUser, mainParentAccessToken, partnerRRP, setBusinessContractMongoId, setBusinessUID, setLoggedInBusiness } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { getAllGeotabDrivers } from '../driver/driver';
import { getAllActiveRRP, getAllContractModuleMasters } from '../standard-pricing/business-standard-pricing';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getBusinessUIDFromWebProfile, startSyncingUsersToLogmaster } from '../user/user';
import { getAllGeotabVehicles } from '../vehicles/vehicles';


export async function createBusinessFromGeotab() {
    let businessName = loggedInUser.firstName;
    if (loggedInUser.lastName != '') {
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
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business', businessDetails, mainParentAccessToken);
        if (response.statusCode == 201) {
            console.log('business created');
            setLoggedInBusiness(this.response.data);
            await createBusinessContract();
        } else {
            console.log('error in business create', this.response);
            displayLogmasterUILastStep();
        }   
    } catch (error) {
        console.log('non http error', error);
        displayLogmasterUILastStep()
    }
};
export async function createBusinessContract() {
    let mainBusinessContractDetails = {
        billingPeriodId: billingPeriodMongoId,
        businessMongoId: loggedInBusiness._id,
        businessModulesDto: partnerRRP,
        contractDurationId: contractDurationMongoId,
        contractDurationYears: 0
    };
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business-contract/business-contract', mainBusinessContractDetails, mainParentAccessToken);
        setBusinessContractMongoId(response.data._id);
        console.log('business default contract created sucessfully', businessContractMongoId);
        acceptBusinessContract();   
    } catch (error) {
        console.log('error on create business contract', error);
        displayLogmasterUILastStep();
    }
};
export async function acceptBusinessContract() {
    try {
        let response = await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business-contract/accept/' + businessContractMongoId, {
            remarks: 'Auto-approved'
        });
        console.log('business contract accepted');
        createBussinesPassword();   
    } catch (error) {
        console.log('error on accept business contract', error);
        displayLogmasterUILastStep();
    }
};
export async function updateLogmasterDataWithGeoTab() {
    try {
        loggedInBusiness['externalSiteId'] = loggedInUser.id;
        let response = await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/' + loggedInBusiness._id, loggedInBusiness, mainParentAccessToken);
        console.log('business external id updated from geotab');
        await checkBusinessEmailAlreadyExists();
    } catch (error) {
        console.log('error updating business', error);
        displayLogmasterUILastStep();
    }
};
export async function checkBusinessEmailAlreadyExists() {
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email', {
            emailAddress: loggedInUser.name
        }, mainParentAccessToken);
        if (response.success) {
            setLoggedInBusiness(response.data);
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
                await updateLogmasterDataWithGeoTab();
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
            let moduleMasterResponse = await getAllContractModuleMasters();
            if(moduleMasterResponse){
                let rrpResponse = await getAllActiveRRP();
                if(rrpResponse) {
                    await createBusinessFromGeotab();
                }
            }
        }
    } catch (error) {
        console.log('error checking business email', email);
        displayLogmasterUILastStep();
    }
};
export async function createBussinesPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    try {
        let response = await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/create-password/' + loggedInBusiness._id, passwordPayload);
        console.log('password created');
        checkBusinessEmailAlreadyExists();   
    } catch (error) {
        console.log('error create password', this.response);
        displayLogmasterUILastStep();
    }
}