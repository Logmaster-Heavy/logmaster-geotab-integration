import { METHODS } from '../../constants/method-constants';
import { api, businessAdminSecurityRole, businessLoggedInAccessToken, businessRole, businessUID, businessUsersToSync, companyGroups, cookieUidCname, loggedInBusiness, loggedInUser, mainParentAccessToken, setBusinessAdminSecurityRole, setBusinessLoggedInAccessToken, setBusinessRole, setBusinessUID, setBusinessUsersToSync } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { deleteCookie, getCookie, setCookie } from '../utils/cookies-service';

export async function checkEmailTheSameAsSavedUID(email, callBackFunctionAfter) {
    return ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/find-by-email',{
        'email': email
    },mainParentAccessToken);
}

export function getBusinessUIDFromWebProfile(userToUse) {
    let mainWebProfile = userToUse.webProfiles.find(function (profile) {
        return profile.isRoot == true;
    });
    if (mainWebProfile) {
        setBusinessUID(mainWebProfile.uid);
        setBusinessRole(mainWebProfile.parentRole);
        deleteCookie(cookieUidCname);
        setCookie(cookieUidCname, businessUID, 0.008);
    }
    displayLogmasterUILastStep();
}
export async function loginUsingUID(uid) {
    return ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/auth/signin-via-token', {
        uid: uid
    });
};

export async function getBusinessSecurityRoles (){
    try {
        let response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/security-role', null, businessLoggedInAccessToken);
        let roles = response.data;
        let adminRole = roles.find(function (singleRole) {
            return singleRole.isAdmin && singleRole.name == 'Admin'
        });
        if(adminRole){
            console.log('adminRole found');
            setBusinessAdminSecurityRole(adminRole._id);
            getUsersFromGeotab();
        } else {
            console.log('adminRole not found');
        }
    } catch (error) {
        console.log('error on fetching security roles', error);
    }
}

export async function syncAllUsersToLogmaster () {
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/create-multiple', businessUsersToSync, businessLoggedInAccessToken);
    } catch (error) {
        console.log('error in syncing users', error);
    }
}

export function getUsersFromGeotab(){
    api.call('Get', {
        typeName: 'User',
        search: {
            companyGroups: companyGroups,
            isDriver: false
        }
    }, function (fetchedUsers) {
        let connectedUsers = fetchedUsers.filter(function (user) {
            return !(user.isDriver || user.name == loggedInUser.name);
        });
        let usersToSyncToLogmaster = connectedUsers.map (function (user)  {
            let fullName = user.firstName;
            if(user.lastName != ''){
                fullName += ' ' + user.lastName;
            }
            return {
                roleId: businessAdminSecurityRole,
                email: user.name.trim(),
                userName: fullName,
                phoneNumber: user.phoneNumber,
                parentUid: getCookie(cookieUidCname),
                parentRole: 'business'
              }
        });
        setBusinessUsersToSync(usersToSyncToLogmaster);
        syncAllUsersToLogmaster();
        //callbackFunction();
    }, function (err) {
        console.log('error in driver fetch', err);
    });
}

export async function startSyncingUsersToLogmaster() {
    let uid = getCookie(cookieUidCname);
    try {
        let response = await loginUsingUID(uid, getBusinessSecurityRoles, setBusinessLoggedInAccessToken);
        setBusinessLoggedInAccessToken(response.data.accessToken);
        await getBusinessSecurityRoles();
    } catch (error) {
        console.log('error logging in parent', error);
    }
}