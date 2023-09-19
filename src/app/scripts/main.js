import { ajaxFetch } from './service/ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from './service/api/services';
import { checkBusinessExistenceAndCreateContract } from './service/business/business';
import { METHODS } from './constants/method-constants';
import { api, childrenGroups, companyGroups, cookieMainURICname, cookieUidCname, getParentUid, loggedInUser, mainLogmasterURI, mainParentAccessToken, mainParentDetails, setAPI, setChildrenGroups, setCompanyGroups, setFinishCallback, setLoggedInUser, setMainLogmasterURI, setMainParentAccessToken, setMainParentDetails, cookieIsGeotabAccountCname, setServiceAccountUser, serviceAccountUser, setServerName, setDatabaseName } from './core/core-variables';
import { changeIframeURI, displayLogmasterUILastStep } from './service/ui/ui-service';
import { checkDriverExistenceAndCreateDriver } from './service/driver/driver';
import { deleteCookie, getCookie, setCookie } from './service/utils/cookies-service';
import { loginUsingUID } from './service/user/user';


/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let getParentData = async function () {
    const endpoint = loggedInUser.isDriver? 'business': 'partner';
    try {
     return ajaxFetch(METHODS.GET, getBaseLogmasterAPIURL() + '/' + endpoint + '/find-one-by-uid/' + getParentUid(), null, mainParentAccessToken);
    } catch (error) {
      console.log('error finding partner', error);
      displayLogmasterUILastStep();
    }
  };
  let checkIfUserLoggedInRecently = async () => {
    try {
      const response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/web-profile/find-by-email', {
        'email': loggedInUser.name
      }, mainParentAccessToken);

      const targetUidFromCookie = getCookie(cookieUidCname);

      if(targetUidFromCookie && targetUidFromCookie === response.data.uid){
        // console.log('User has logged in recently, skipping sync.');
        displayLogmasterUILastStep();
      } else {
        deleteCookie(cookieUidCname);
        setCookie(cookieUidCname, response.data.uid, 0.008)
        // const parentsData = await getParentData();
        // setMainParentDetails(parentsData.data);
        // if (loggedInUser.isDriver) {
        //   console.log('Driver hasn\'t logged in recently, starting sync.');
        //   await checkDriverExistenceAndCreateDriver();
        // } else {
        //   console.log('Business hasn\'t logged in recently, starting sync.');
        //   await checkBusinessExistenceAndCreateContract();
        // }
        // console.log('Sync completed');
        displayLogmasterUILastStep();
      }
    } catch (error) {
      console.log('checkIfUserLoggedInRecently: error fetching user from logmaster', error);
      displayLogmasterUILastStep();
    }
  };
  let getGroupOfLoggedInUser =  function (groupId) {
    api.call('Get', {
      typeName: 'Group',
      search: {
        id: groupId
      }
    }, function (fetchedGroup) {
      if (fetchedGroup.length === 0) {
        console.log('no groups found');
        displayLogmasterUILastStep();
        return;
      }

      const group = fetchedGroup[0];
      const {children, id} = group;
      const initChildrenGroups = children;
      initChildrenGroups.push({ id });
      setChildrenGroups(initChildrenGroups.map(function (child) {
        return { id: child.id }
      }));

      // Step #3 - Final
      checkIfUserLoggedInRecently()
    });
  };
  let getLoggedInUser = function () {   
    api.getSession(function (session, server) {
      api.call('Get', {
        typeName: 'User',
        search: {
          name: null // get all users
        }
      }, async function (users) {
        const {userName, database} = session;
        
        // const serviceAccountName = `logmaster-service@${database}`;
        // if (users.length === 0) {
        //   console.log('Unable to find currently logged in user.');
        //   return;
        // }

        // const targetServiceAccount = users.find((user)=> user.name === serviceAccountName);
        const loggedInUser = users.find((user)=> user.name === userName);

        const loginResponse = await loginUsingUID(getParentUid());
        setMainParentAccessToken(loginResponse.data.accessToken);
        setLoggedInUser(loggedInUser);

        // if (!targetServiceAccount) {
        //   console.log('Service Account not created, please contact support.');
        //   displayLogmasterUILastStep();
        //   return;
        // }

        // const businessResponse = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email', {
        //   emailAddress: userName
        // }, mainParentAccessToken);

        // console.log('userName: ', userName);
        // console.log('businessResponse: ', businessResponse);

        // if (!businessResponse.success) {
        //   console.log('Service Account not created, please contact support.');
        //   displayLogmasterUILastStep();
        //   return;
        // }

        setServerName(server);
        setDatabaseName(database);
        // setServiceAccountUser(targetServiceAccount)

        if (loggedInUser && !loggedInUser.companyGroups.length) {
          console.log('logged in user does not belong to a group');
          displayLogmasterUILastStep();
          return;
        }
  
        setCompanyGroups(
          loggedInUser.companyGroups.map(function (group) {
            return {
              id: group.id,
            };
          })
        );
  
        // Step #2
        getGroupOfLoggedInUser(loggedInUser.companyGroups[0].id);
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
    initialize: async function (freshApi, freshState, initializeCallback) {
      setMainLogmasterURI(document.getElementById('mainLogmasterURI').value);
      setAPI(mainGeotabAPI);
      // MUST call initializeCallback when done any setup
      setFinishCallback(initializeCallback);
      // Step #1
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
        changeIframeURI();
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
    }
  };
};