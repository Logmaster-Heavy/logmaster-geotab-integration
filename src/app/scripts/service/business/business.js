import { METHODS } from '../../constants/method-constants';
import { api, billingPeriodMongoId, businessContractMongoId, businessUID, contractDurationMongoId, cookieUidCname, databaseName, defaultPassword, loggedInBusiness, loggedInUser, logmasterK, mainParentAccessToken, partnerRRP, serverName, serviceAccountUser, setBusinessContractMongoId, setBusinessUID, setLoggedInBusiness, setPartnerRRP } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { syncGeotabDriversToLogmaster } from '../driver/driver';
import { getAllActiveRRP, getAllContractModuleMasters } from '../standard-pricing/business-standard-pricing';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { getUIDFromWebProfile, syncUsersToLogmaster } from '../user/user';
import { syncGeotabVehiclesToLogmaster } from '../vehicles/vehicles';


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
        const response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business', businessDetails, mainParentAccessToken);
        if (response.statusCode == 201) {
            console.log('business created');
            setLoggedInBusiness(response.data);
            await createBusinessContract();
        } else {
            console.log('createBusinessFromGeotab response error: ', response);
            displayLogmasterUILastStep();
        }   
    } catch (error) {
        console.log('createBusinessFromGeotab error:', error);
        displayLogmasterUILastStep()
    }
};
export async function createBusinessContract() {
    // update with business id
    setPartnerRRP(partnerRRP.map((rrp) => {
        rrp.ownerMongoId = loggedInBusiness._id;
        return rrp;
    }))
    
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
        console.log('createBusinessContract error: ', error);
        displayLogmasterUILastStep();
    }
};
export async function acceptBusinessContract() {
    try {
        await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business-contract/accept/' + businessContractMongoId, {
            remarks: 'Auto-approved'
        });
        console.log('business contract accepted');
        createBusinessPassword();   
    } catch (error) {
        console.log('acceptBusinessContract error: ', error);
        displayLogmasterUILastStep();
    }
};
export async function updateExternalSiteIdLogmaster() {
    try {
        loggedInBusiness['externalSiteId'] = loggedInUser.id;
        await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/' + loggedInBusiness._id, loggedInBusiness, mainParentAccessToken);
        await checkBusinessExistenceAndCreateContract();
    } catch (error) {
        console.log('updateExternalSiteIdLogmaster error:', error);
        displayLogmasterUILastStep();
    }
};
export async function checkBusinessExistenceAndCreateContract() {
    try {
        const response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email', {
            emailAddress: loggedInUser.name
        }, mainParentAccessToken);
        // Business exists
        if (response.success) {
            setLoggedInBusiness(response.data);
            const {externalSiteId, geotabCredentials} = loggedInBusiness
            
            if (!geotabCredentials) {
                console.log('Geotab credentials for service account not set, please contact support');
                displayLogmasterUILastStep();
                return;
            }
            const decryptedPassword = CryptoJS.AES.decrypt(geotabCredentials.serviceAccountPassword, logmasterK).toString(CryptoJS.enc.Utf8);
            // Service Account login
            api.call(
                'Authenticate', {
                    database: databaseName,
                    userName: serviceAccountUser.name,
                    password: decryptedPassword,
                },
                async () => {
                console.log('Service account authenticated!');
                if (externalSiteId) {
                    await Promise.all[
                        syncGeotabVehiclesToLogmaster(),
                        syncGeotabDriversToLogmaster(),
                        getUIDFromWebProfile(loggedInBusiness)
                    ]
                    await syncUsersToLogmaster();
     
                } else {
                    await updateExternalSiteIdLogmaster();
                }
            }, (error)=>{
                console.log('Service account authentication error: ', error);
                displayLogmasterUILastStep();
            })
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
        console.log('checkBusinessExistenceAndCreateContract: error checking business email', error);
        displayLogmasterUILastStep();
    }
};
export async function createBusinessPassword() {
    let passwordPayload = {
        'password': defaultPassword,
        'confirmPassword': defaultPassword
    };
    try {
        await ajaxFetch(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/create-password/' + loggedInBusiness._id, passwordPayload);
        console.log('password created');
        checkBusinessExistenceAndCreateContract();   
    } catch (error) {
        console.log('error create password', this.response);
        displayLogmasterUILastStep();
    }
}