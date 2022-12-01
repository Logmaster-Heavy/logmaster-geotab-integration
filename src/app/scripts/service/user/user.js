import { METHODS } from '../../constants/method-constants';
import { businessRole, businessUID, cookieUidCname, mainParentAccessToken, setBusinessRole, setBusinessUID } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { deleteCookie, getCookie, setCookie } from '../utils/cookies-service';

export function checkEmailTheSameAsSavedUID (email, callBackFunctionAfter) {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/find-by-email',
     function() {
        //onload
        if(this.response.data.uid == getCookie(cookieUidCname)){
            //if email is the same uid
            console.log('email is the same as uid');
            displayLogmasterUILastStep();
        } else {
            console.log('email is NOT the same as uid');
            callBackFunctionAfter();
        }
     },
     function() {
        //onerror
        console.log('error on checking email', this.response);
        displayLogmasterUILastStep();
     },
     mainParentAccessToken)
     .send(JSON.stringify({
        'email': email
     }))

}

export function getBusinessUIDFromWebProfile(userToUse) {
    let mainWebProfile = userToUse.webProfiles.find(function (profile) {
        return profile.isRoot == true;
    });
    console.log('mainWebProfile', mainWebProfile);
    if (mainWebProfile) {
        setBusinessUID(mainWebProfile.uid);
        console.log('businessUID', businessUID);
        setBusinessRole(mainWebProfile.parentRole);
        console.log('businessRole', businessRole);
        deleteCookie(cookieUidCname);
        console.log('delete cookieUidCname');
        setCookie(cookieUidCname, businessUID);
        console.log('cookie set', getCookie(cookieUidCname));
    }
    displayLogmasterUILastStep();
}