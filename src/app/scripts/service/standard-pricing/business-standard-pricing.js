import { METHODS } from '../../constants/method-constants';
import { contractModuleMasters, mainParentAccessToken, mainPartnerDetails, partnerRRP, setContractModuleMasters, setPartnerRRP } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';


export function getAllContractModuleMasters (callBackFunction) {
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/contract-module-master',
        function () {
            //onload
            setContractModuleMasters(this.response.data);
            console.log('contract module masters', contractModuleMasters);
            callBackFunction();
        },
        function () {
            //onerror
            console.log('failed contract module masters', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send();
};

export function getAllActiveRRP (callBackFunction) {
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/standard-pricing/find-all-active-rrp-to-business/' + mainPartnerDetails._id,
        function () {
            //on load
            console.log('partner rrp fetched', this.response.data);
            setPartnerRRP(this.response.data.map(function (partnerRRP) {
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
            callBackFunction();
        },
        function () {
            //on error
            console.log('error fetching rrp', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send();
};