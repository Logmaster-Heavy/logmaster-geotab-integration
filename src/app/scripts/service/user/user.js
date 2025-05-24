import { METHODS } from "../../constants/method-constants";
import {
  api,
  businessAdminSecurityRole,
  businessLoggedInAccessToken,
  businessRole,
  businessUID,
  businessUsersToSync,
  companyGroups,
  cookieUidCname,
  loggedInBusiness,
  loggedInUser,
  mainParentAccessToken,
  setBusinessAdminSecurityRole,
  setBusinessLoggedInAccessToken,
  setBusinessRole,
  setBusinessUID,
  setBusinessUsersToSync,
} from "../../core/core-variables";
import { ajaxFetch } from "../ajax/ajax-helper";
import { getBaseLogmasterAPIURL } from "../api/services";
import { displayLogmasterUILastStep } from "../ui/ui-service";
import { deleteCookie, getCookie, setCookie } from "../utils/cookies-service";

// entity could be either business or driver
export function getUIDFromWebProfile(entity) {
  let mainWebProfile = entity.webProfiles.find(function (profile) {
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
export async function loginWithOrgUserId(orgUserId) {
  return ajaxFetch(
    METHODS.POST,
    getBaseLogmasterAPIURL() + `/auth/v2/org-user/${orgUserId}/login`
  );
}

export async function getBusinessAdminRole() {
  try {
    const response = await ajaxFetch(
      METHODS.GET,
      getBaseLogmasterAPIURL() + "/security-role",
      null,
      businessLoggedInAccessToken
    );
    const adminRole = response.data.find(function (role) {
      return role.isAdmin;
    });
    if (adminRole) {
      setBusinessAdminSecurityRole(adminRole._id);
      return true;
    } else {
      console.log("adminRole not found. Abort syncing users.");
      return false;
    }
  } catch (error) {
    console.log(
      "getBusinessAdminRole: error on fetching security roles",
      error
    );
    return false;
  }
}

export function getUsersFromGeotabAndSyncToLogmaster() {
  api.call(
    "Get",
    {
      typeName: "User",
      search: {
        companyGroups: companyGroups,
        isDriver: false,
      },
    },
    async function (fetchedUsers) {
      const connectedUsers = fetchedUsers.filter(function (user) {
        return !(user.isDriver || user.name == loggedInUser.name);
      });
      const usersToSyncToLogmaster = connectedUsers.map(function (user) {
        let fullName = user.firstName;
        if (user.lastName != "") {
          fullName += " " + user.lastName;
        }
        return {
          roleId: businessAdminSecurityRole,
          email: user.name.trim(),
          userName: fullName,
          phoneNumber: user.phoneNumber,
          parentUid: getCookie(cookieUidCname),
          parentRole: "business",
          externalEntityId: loggedInUser.id,
        };
      });
      setBusinessUsersToSync(usersToSyncToLogmaster);
      try {
        await ajaxFetch(
          METHODS.POST,
          getBaseLogmasterAPIURL() + "/web-profile/create-multiple",
          businessUsersToSync,
          businessLoggedInAccessToken
        );
        console.log("users sync completed");
      } catch (error) {
        console.log(
          "getUsersFromGeotabAndSyncToLogmaster: error in syncing users",
          error
        );
      }
    },
    function (err) {
      console.log("error in driver fetch", err);
    }
  );
}

export async function syncUsersToLogmaster() {
  let orgUserId = getCookie(cookieUidCname);
  try {
    const response = await loginWithOrgUserId(orgUserId);
    setBusinessLoggedInAccessToken(response.data.accessToken);
    const adminRole = await getBusinessAdminRole();
    if (adminRole) {
      getUsersFromGeotabAndSyncToLogmaster();
    }
  } catch (error) {
    console.log("syncUsersToLogmaster: error logging in parent", error);
  }
}
