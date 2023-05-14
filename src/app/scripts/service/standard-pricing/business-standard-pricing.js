import { METHODS } from '../../constants/method-constants';
import { contractModuleMasters, mainParentAccessToken, mainParentDetails, partnerRRP, setContractModuleMasters, setPartnerRRP } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';


export async function getAllContractModuleMasters () {
    try {
        let response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/contract-module-master', null, mainParentAccessToken);
        setContractModuleMasters(response.data);
        return true
    } catch (error) {
        console.log('failed contract module masters', error);
        displayLogmasterUILastStep();
    }
    return false;
};

export async function getAllActiveRRP () {
    try {
        const response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/standard-pricing/find-all-active-rrp-to-business/' + mainParentDetails._id, null, mainParentAccessToken);
        setPartnerRRP(response.data.map((partnerRRP) => {
            const { standardPricingMaster: { apiTag }, pricing: { monthly } } = partnerRRP;
            const contractModuleMaster = contractModuleMasters.find((module) => {
                return module.apiTag == apiTag
            });
            const { _id: masterId } = contractModuleMaster;
            return {
                masterId,
                minimums: 0,
                price: {
                    monthly: Number(monthly),
                    yearly: 0
                },
                ownerMongoId: null, // to be updated after business creation
                ownerRole: 'business'
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