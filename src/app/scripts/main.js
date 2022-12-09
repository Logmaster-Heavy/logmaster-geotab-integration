import { ajaxInit } from './service/ajax/ajax-helper';
import { getBaseLogmasterAPIURL, getBaseLogmasterURL } from './service/api/services';
import { checkBusinessEmailAlreadyExists } from './service/business/business';
import { METHODS } from './constants/method-constants';
import { api, childrenGroups, companyGroups, cookieMainURICname, cookieUidCname, getParentUid, loggedInUser, logmasterK, mainLogmasterURI, mainParentAccessToken, mainParentDetails, setAPI, setChildrenGroups, setCompanyGroups, setFinishCallback, setLoggedInUser, setMainLogmasterURI, setMainParentAccessToken, setMainParentDetails } from './core/core-variables';
import { changeIframeURI, displayLogmasterUILastStep } from './service/ui/ui-service';
import { checkDriverEmailAlreadyExists } from './service/driver/driver';
import { getAllGeotabVehicles } from './service/vehicles/vehicles';
import { deleteCookie, getCookie, setCookie } from './service/utils/cookies-service';
import { checkEmailTheSameAsSavedUID, loginUsingUID } from './service/user/user';


/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let getParentDetails = function () {
    let endpoint = 'partner';
    if(loggedInUser.isDriver){
      endpoint = 'business';
    }
    console.log('endpoint', endpoint);
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/' + endpoint + '/find-one-by-uid/' + getParentUid(),
      function () {
        // onload
        setMainParentDetails(this.response.data);
        console.log('parent details fetched', mainParentDetails);
        if (loggedInUser.isDriver) {
          checkDriverEmailAlreadyExists();
        } else {
          //business
          checkBusinessEmailAlreadyExists();
        }
      },
      function () {
        console.log('error fetching parent', this.response);
        displayLogmasterUILastStep();
      },
      mainParentAccessToken)
      .send();
  };
  let checkFirstIfEmailTheSameAsSavedUID = function () {
    checkEmailTheSameAsSavedUID(loggedInUser.name, getParentDetails);
  };
  
  let syncLoggedInUserToLogmaster = function () {
    loginUsingUID(getParentUid(), checkFirstIfEmailTheSameAsSavedUID, setMainParentAccessToken);
    //loginUsingUID(getParentUid(), getParentDetails);
  };
  let getGroupOfLoggedInUser = function (groupId) {
    api.call('Get', {
      typeName: 'Group',
      search: {
        id: groupId
      }
    }, function (fetchedGroup) {
      console.log('fetchedGroup', fetchedGroup);
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
          console.log('children of group', childrenGroups);
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
        console.log('result from getSession', result);
        if (result.length === 0) {
          console.log('Unable to find currently logged on user.');
          displayLogmasterUILastStep();
        } else {
          setLoggedInUser(result[0]);
          console.log('logged in user', loggedInUser);

          if (loggedInUser.companyGroups.length > 0) {
            setCompanyGroups(loggedInUser.companyGroups.map (function (group) {
              return {
                id: group.id
              }
            }));
            console.log('companyGroups', companyGroups);
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
      // Loading translations if available
      // if (freshState.translate) {
      //   freshState.translate(elAddin || '');
      // }
      console.log('global.state', global.environment);
      // MUST call initializeCallback when done any setup
      setMainLogmasterURI(document.getElementById('mainLogmasterURI').value);
      setAPI(mainGeotabAPI);
      setFinishCallback(initializeCallback);
      const currentUid = getCookie(cookieUidCname);
      console.log('cookieUidCname onnit ', getCookie(cookieUidCname));
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
      console.log('cookieMainURICName', mainLogmasterURI);
      let currentSRC = document.getElementById('logmaster-main-iframe').src;
      console.log('currentSRC', currentSRC);
      if (currentSRC != mainLogmasterURI) {
        changeIframeURI('focus');
      }
      // getting the current user to display in the UI
      // freshApi.getSession(session => {
      //   elAddin.querySelector('#logmasterEwd2-user').textContent = session.userName;
      // });


      // elAddin.className = '';
      // show main content

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
