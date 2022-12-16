import { METHODS } from '../../constants/method-constants';
import { contractModuleMasters, mainParentAccessToken, mainParentDetails, partnerRRP, setContractModuleMasters, setPartnerRRP } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';


export async function getAllContractModuleMasters () {
    try {
        let response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/contract-module-master', null, mainParentAccessToken);
        setContractModuleMasters(response.data);
        console.log('contract module masters', contractModuleMasters);
        return true
    } catch (error) {
        console.log('failed contract module masters', error);
        displayLogmasterUILastStep();
    }
    return false;
};

export async function getAllActiveRRP () {
    try {
        let response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/standard-pricing/find-all-active-rrp-to-business/' + mainParentDetails._id, null, mainParentAccessToken);
        console.log('partner rrp fetched', response.data);
        setPartnerRRP(response.data.map(function (partnerRRP) {
            let contractModuleMaster = contractModuleMasters.find(function (module) {
                return module.apiTag == partnerRRP.standardPricingMaster.apiTag
            });
            return {
                masterId: contractModuleMaster._id,
                minimums: 0,
                price: {
                    monthly: partnerRRP.pricing.monthly,
                    yearly: 0
                }
            }
        }));
        console.log('partnerRRP applied', partnerRRP);
        return true;
    } catch (error) {
        console.log('error fetching rrp', error);
        displayLogmasterUILastStep();
    }
    return false;
};