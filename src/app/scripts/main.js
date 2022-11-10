import { ajaxInit } from './service/ajax/ajax-helper';
import { getBaseLogmasterAPIURL, getBaseLogmasterURL } from './service/api/services';
import { checkBusinessEmailAlreadyExists } from './service/business/business';
import { METHODS } from './constants/method-constants';
import { api, childrenGroups, finishCallback, loggedInUser, mainLogmasterURI, mainParentAccessToken, mainPartnerDetails, mainPartnerUID, setAPI, setChildrenGroups, setFinishCallback, setLoggedInUser, setLoggedInUserVehicles, setMainLogmasterURI, setMainParentAccessToken, setMainPartnerDetails } from './core/core-variables';
import { displayLogmasterUILastStep } from './service/ui/ui-service';
import { checkDriverEmailAlreadyExists } from './service/driver/driver';
import { getAllGeotabVehicles } from './service/vehicles/vehicles';


/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let getPartnerDetails = function () {
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/partner/find-one-by-uid/' + mainPartnerUID,
      function () {
        // onload
        setMainPartnerDetails(this.response.data);
        console.log('parnter details fetched', mainPartnerDetails);
        if (loggedInUser.isDriver) {
          checkDriverEmailAlreadyExists();
        } else {
          //business
          checkBusinessEmailAlreadyExists();
        }
      },
      function () {
        console.log('error fetching partner', this.response);
        displayLogmasterUILastStep();
      },
      mainParentAccessToken)
      .send();
  };
  let loginUsingUID = function (uid, callBackAfterLogin) {
    console.log('start logging in partner');
    let onLoadFunc = function () {
      setMainParentAccessToken(this.response.data.accessToken);
      console.log('mainParentAccessToken fetched');
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
  let callFetchAllVehicles = function () {
    getAllGeotabVehicles(getPartnerDetails);
  };
  let syncLoggedInUserAndVehiclesToLogmaster = function () {
    loginUsingUID(mainPartnerUID, getPartnerDetails);
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
        if (initChildrenGroups.length > 0) {
          setChildrenGroups(initChildrenGroups.map(function (child) {
            return {
              id: child.id
            }
          }));
          console.log('children of group', childrenGroups);
          syncLoggedInUserAndVehiclesToLogmaster();
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
      let currentSRC = document.getElementById('logmaster-main-iframe').src;
      console.log('currentSRC', currentSRC);
      if (currentSRC != mainLogmasterURI) {
        console.log('currentSRC updated to ', mainLogmasterURI);
        document.getElementById('logmaster-main-iframe').src = getBaseLogmasterURL() + mainLogmasterURI;
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
