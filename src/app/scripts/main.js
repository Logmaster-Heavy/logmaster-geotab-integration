import { ajaxFetch } from './service/ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from './service/api/services';
import { checkBusinessEmailAlreadyExists } from './service/business/business';
import { METHODS } from './constants/method-constants';
import { api, childrenGroups, companyGroups, cookieMainURICname, cookieUidCname, getParentUid, loggedInUser, mainLogmasterURI, mainParentAccessToken, mainParentDetails, setAPI, setChildrenGroups, setCompanyGroups, setFinishCallback, setLoggedInUser, setMainLogmasterURI, setMainParentAccessToken, setMainParentDetails } from './core/core-variables';
import { changeIframeURI, displayLogmasterUILastStep } from './service/ui/ui-service';
import { checkDriverEmailAlreadyExists } from './service/driver/driver';
import { deleteCookie, getCookie, setCookie } from './service/utils/cookies-service';
import { loginUsingUID } from './service/user/user';


/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let getParentDetails = async function () {
    let endpoint = 'partner';
    if (loggedInUser.isDriver) {
      endpoint = 'business';
    }
    try {
      console.log('endpoint', endpoint);
      let response = await ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/' + endpoint + '/find-one-by-uid/' + getParentUid(), null, mainParentAccessToken);
      setMainParentDetails(response.data);
      console.log('parent details fetched', mainParentDetails);
      if (loggedInUser.isDriver) {
        //driver
        checkDriverEmailAlreadyExists();
      } else {
        //business
        checkBusinessEmailAlreadyExists();
      }
    } catch (error) {
      console.log('error finding partner', error);
      displayLogmasterUILastStep();
    }
  };
  let checkFirstIfEmailTheSameAsSavedUID = async function () {
    try {
      let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/find-by-email', {
        'email': loggedInUser.name
      }, mainParentAccessToken);

      deleteCookie(cookieUidCname);
      setCookie(cookieUidCname, response.data.uid, 0.008)

      const targetUidFromCookie = getCookie(cookieUidCname);

      console.log('response.data.uid: ', response.data.uid);
      console.log('targetUidFromCookie: ', targetUidFromCookie);
      if(response.data.uid == targetUidFromCookie){
        console.log('email logged in is the same');
        displayLogmasterUILastStep();
      } else {
        console.log('email logged in NOT the same');
        await getParentDetails();
      }
    } catch (error) {
      console.log('error checking email', error);
      displayLogmasterUILastStep();
    }
  };

  let syncLoggedInUserToLogmaster = async function () {
    try {
      let response = await loginUsingUID(getParentUid());
      console.log('syncLoggedInUserToLogmaster accessToken: ', response.data.accessToken);
      setMainParentAccessToken(response.data.accessToken);
      setCookie('accessToken', response.data.accessToken);
      await checkFirstIfEmailTheSameAsSavedUID();
    } catch (error) {
      console.log('error logging in parent', error);
      displayLogmasterUILastStep();
    }
    //loginUsingUID(getParentUid(), getParentDetails);
  };
  let getGroupOfLoggedInUser =  function (groupId) {
    api.call('Get', {
      typeName: 'Group',
      search: {
        id: groupId
      }
    }, function (fetchedGroup) {
      if (fetchedGroup.length > 0) {
        let group = fetchedGroup[0];
        let initChildrenGroups = group.children;
        initChildrenGroups.push({
          id: group.id
        });
        if (initChildrenGroups.length > 0) {
          setChildrenGroups(initChildrenGroups.map(function (child) {
            return {
              id: child.id
            }
          }));
          syncLoggedInUserToLogmaster();
        } else {
          displayLogmasterUILastStep();
        }
      } else {
        console.log('no groups found');
        displayLogmasterUILastStep();
      }
    });
  };
  let getLoggedInUser = function () {
    api.getSession(function (session) {
      let currentUser = session.userName;
      api.call('Get', {
        typeName: 'User',
        search: {
          name: currentUser
        }
      }, function (result) {
        if (result.length === 0) {
          console.log('Unable to find currently logged on user.');
          displayLogmasterUILastStep();
        } else {
          setLoggedInUser(result[0]);

          if (loggedInUser.companyGroups.length > 0) {
            setCompanyGroups(loggedInUser.companyGroups.map(function (group) {
              return {
                id: group.id
              }
            }));
            getGroupOfLoggedInUser(loggedInUser.companyGroups[0].id);
          } else {
            console.log('logged in user does not belong to a group');
            displayLogmasterUILastStep();
          }
        }
      });
    });
  };

  return {

    /**
     * initialize() is called only once when the Add-In is first loaded. Use this function to initialize the
     * Add-In's state such as default values or make API requests (MyGeotab or external) to ensure interface
     * is ready for the user.
     * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
     * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
     * @param {function} initializeCallback - Call this when your initialize route is complete. Since your initialize routine
     *        might be doing asynchronous operations, you must call this method when the Add-In is ready
     *        for display to the user.
     */
    initialize: function (freshApi, freshState, initializeCallback) {
      setMainLogmasterURI(document.getElementById('mainLogmasterURI').value);
      setAPI(mainGeotabAPI);
      // MUST call initializeCallback when done any setup
      setFinishCallback(initializeCallback);
      getLoggedInUser();
    },

    /**
     * focus() is called whenever the Add-In receives focus.
     *
     * The first time the user clicks on the Add-In menu, initialize() will be called and when completed, focus().
     * focus() will be called again when the Add-In is revisited. Note that focus() will also be called whenever
     * the global state of the MyGeotab application changes, for example, if the user changes the global group
     * filter in the UI.
     *
     * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
     * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
    */
    focus: function (freshApi, freshState) {
      setMainLogmasterURI(document.getElementById('mainLogmasterURI').value);
      deleteCookie(cookieMainURICname);
      setCookie(cookieMainURICname, mainLogmasterURI);
      let currentSRC = document.getElementById('logmaster-main-iframe').src;
      if (currentSRC != mainLogmasterURI) {
        changeIframeURI('focus');
      }
    },

    /**
     * blur() is called whenever the user navigates away from the Add-In.
     *
     * Use this function to save the page state or commit changes to a data store or release memory.
     *
     * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
     * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
    */
    blur: function () {
      // hide main content
      // elAddin.className += ' hidden';
    }
  };
};