/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (api, state) {
  'use strict';


  // the root container
  // var elAddin = document.getElementById('logmasterEwd2');
  let mainLogmasterURI = document.getElementById('mainLogmasterURI').value;


  const ajax = new XMLHttpRequest();

  let devBaseLogmasterURL = 'http://localhost:8080';
  let devBaseAPIURL = 'http://localhost:3005';

  // let prodBaseLogmasterURL = 'https://logmaster.au';
  // let prodBaseLogmasterAPIURL = 'https://prod-api.logmaster.au'

  let prodBaseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
  let prodBaseLogmasterAPIURL = 'https://logmaster-portal-navigation-z626q6mhla-ts.a.run.app'

  let mainParentUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
  let mainParentAccessToken;

  let loggedInUser;
  let loggedInUserVehicles;

  let finishCallback;

  let getBaseLogmasterURL = function () {
    if (global.environment === 'dev') {
      return devBaseLogmasterURL;
    }
    return prodBaseLogmasterURL;
  };
  let getBaseLogmasterAPIURL = function () {
    if (global.environment === 'dev') {
      return devBaseAPIURL;
    }
    return prodBaseLogmasterAPIURL;
  };
  let displayLogmasterUILastStep = function () {
    console.log('baseLogmasterURL + mainLogmasterURI', getBaseLogmasterURL() + mainLogmasterURI);
    document.getElementById('logmaster-main-iframe').src = getBaseLogmasterURL() + mainLogmasterURI;
    finishCallback();
  };
  let setAjaxTypeAfterOpen = function () {
    ajax.responseType = 'json';
    ajax.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  };
  let createBusinessFromGeotab = function () {
    let businessName = loggedInUser.firstName + ' ' + loggedInUser.lastName;
    let businessDetails = {
      'persona': {
        'businessName': businessName,
        'tradingName': businessName,
        'abn': '',
        'businessAddress': loggedInUser.authorityAddress,
        'contactUserName': loggedInUser.name,
        'contactEmail': loggedInUser.name,
        'contactPhoneNumber': loggedInUser.phoneNumber
      },
      'isActive': true,
      'isExternal': true,
      'demoOption': 'NO_DEMO'
    };
    console.log('business-body', businessDetails);
    ajax.onload = function () {
      console.log('business created');
      displayLogmasterUILastStep();
    };
    ajax.onerror = function () {
      // handle non-HTTP error (e.g. network down)
      console.log('non http error', ajax.response);
      displayLogmasterUILastStep();
    };
    ajax.open('POST', getBaseLogmasterAPIURL() + '/business');
    setAjaxTypeAfterOpen();
    ajax.setRequestHeader('Authorization', 'Bearer ' + mainParentAccessToken);
    ajax.send();
  };
  let loginUsingUID = function (uid, callBackAfterLogin) {
    console.log('start logging in partner');
    ajax.onload = function () {
      mainParentAccessToken = ajax.response.data.accessToken;
      console.log('mainParentAccessToken fetched');
      callBackAfterLogin();
    };
    ajax.onerror = function () {
      console.log('error', ajax.response);
    };
    ajax.open('POST', getBaseLogmasterAPIURL() + '/auth/signin-via-token');
    setAjaxTypeAfterOpen();
    ajax.send(JSON.stringify({
      uid: uid
    }));
  };
  let syncLoggedInUserAndVehiclesToLogmaster = function () {
    loginUsingUID(mainParentUID, createBusinessFromGeotab);
  };
  let getVehicles = function (groupIds) {
    api.call('Get', {
      typeName: 'Device',
      search: {
        groups: groupIds
      }
    }, function (fetchedVehicles) {
      console.log('fetchedVehicles', fetchedVehicles);
      loggedInUserVehicles = fetchedVehicles;
      syncLoggedInUserAndVehiclesToLogmaster();
    });
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
          console.log('children of group', initChildrenGroups);
          let childrenGroups = initChildrenGroups.map(function (child) {
            return {
              id: child.id
            }
          });
          getVehicles(childrenGroups);
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
          loggedInUser = result[0];
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
      finishCallback = initializeCallback;
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
      let currentSRC = document.getElementById('logmaster-main-iframe').src;
      if(currentSRC != mainLogmasterURI){
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
