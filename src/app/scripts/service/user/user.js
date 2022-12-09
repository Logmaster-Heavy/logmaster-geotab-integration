import { METHODS } from '../../constants/method-constants';
import { api, businessAdminSecurityRole, businessLoggedInAccessToken, businessRole, businessUID, businessUsersToSync, companyGroups, cookieUidCname, loggedInBusiness, loggedInUser, mainParentAccessToken, setBusinessAdminSecurityRole, setBusinessLoggedInAccessToken, setBusinessRole, setBusinessUID, setBusinessUsersToSync } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';
import { deleteCookie, getCookie, setCookie } from '../utils/cookies-service';

export function checkEmailTheSameAsSavedUID(email, callBackFunctionAfter) {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/find-by-email',
        function () {
            //onload
            console.log('email fetch result', this.response);
            if(this.response.success && this.response.data.uid == getCookie(cookieUidCname)){
                //if email is the same uid
                console.log('email is the same as uid');
                displayLogmasterUILastStep();
            } else {
                console.log('email is NOT the same as uid');
                callBackFunctionAfter();
            }
        },
        function () {
            //onerror
            console.log('error on checking email', this.response);
            displayLogmasterUILastStep();
        },
        mainParentAccessToken)
        .send(JSON.stringify({
            'email': email
        }));

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
        setCookie(cookieUidCname, businessUID, 0.008);
        console.log('cookie set', getCookie(cookieUidCname));
    }
    displayLogmasterUILastStep();
}
export function loginUsingUID(uid, callBackAfterLogin, accessTokenSetter) {
    console.log('start logging in parent');
    let onLoadFunc = function () {
        accessTokenSetter(this.response.data.accessToken);
        //setMainParentAccessToken(this.response.data.accessToken);
        console.log('accessTokenSetter fetched');
        callBackAfterLogin();
    };
    let onErrorFunc = function () {
        console.log('error signing in partner', this.response);
        displayLogmasterUILastStep();
    };
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/auth/signin-via-token',
        onLoadFunc,
        onErrorFunc)
        .send(JSON.stringify({
            uid: uid
        }));
};

export function getBusinessSecurityRoles (){
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/security-role',
        function () {
            //onload
            if(this.response.success){
                let roles = this.response.data;
                console.log('fetchedRoles', roles);
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
            } else {
                console.log('error on fetching security roles', this.response);
            }
        },
        function () {
            //onerror
            console.log('non http error fetching roles', this.response);
        },
        businessLoggedInAccessToken)
        .send();
}

export function syncAllUsersToLogmaster () {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/create-multiple',
        function () {
            //onload
            console.log('success users syncing', this.response.message);
        },
        function () {
            //onerror
            console.log('error in syncing users', this.response);
        },
        businessLoggedInAccessToken)
        .send(JSON.stringify(businessUsersToSync));
}

export function getUsersFromGeotab(){
    api.call('Get', {
        typeName: 'User',
        search: {
            companyGroups: companyGroups,
            isDriver: false
        }
    }, function (fetchedUsers) {
        console.log('fetchedUsers', fetchedUsers);
        let connectedUsers = fetchedUsers.filter(function (user) {
            return !(user.isDriver || user.name == loggedInUser.name);
        });
        console.log('only users', connectedUsers);
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
        console.log('usersToSyncToLogmaster', usersToSyncToLogmaster);
        syncAllUsersToLogmaster();
        //callbackFunction();
    }, function (err) {
        console.log('error in driver fetch', err);
    });
}

export function startSyncingUsersToLogmaster() {
    let uid = getCookie(cookieUidCname);
    loginUsingUID(uid, getBusinessSecurityRoles, setBusinessLoggedInAccessToken);
}