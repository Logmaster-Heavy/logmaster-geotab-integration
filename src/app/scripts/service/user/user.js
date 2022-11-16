import { businessUID, cookieUidCname, setBusinessUID } from '../../core/core-variables';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { deleteCookie, getCookie, setCookie } from '../utils/cookies-service';

;
export function getBusinessUIDFromWebProfile(userToUse) {
    let mainWebProfile = userToUse.webProfiles.find(function (profile) {
        return profile.isRoot == true;
    });
    console.log('mainWebProfile', mainWebProfile);
    if (mainWebProfile) {
        setBusinessUID(mainWebProfile.uid);
        console.log('businessUID', businessUID);
        deleteCookie(cookieUidCname);
        console.log('delete cookieUidCname');
        setCookie(cookieUidCname, businessUID);
        console.log('cookie set', getCookie(cookieUidCname));
    }
    displayLogmasterUILastStep();
}