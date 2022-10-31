/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function () {
  'use strict';


  // the root container
  var elAddin = document.getElementById('logmasterEwd2');


  const ajax = new XMLHttpRequest();

  let localBaseLogmasterURL = 'http://localhost:8080';
  let localBaseAPIURL = 'http://localhost:3005';

  let mainParentUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
  let mainParentAccessToken;

  let loggedInUser;
  let loggedInUserVehicles;

  let finishCallback;
  let loginUsingUID = function (uid, callBackAfterLogin) {
    ajax.onload = function () {
      mainParentAccessToken = ajax.response.data.accessToken;
      console.log('mainParentAccessToken fetched');
      callBackAfterLogin();
    };
    ajax.responseType = 'json';
    ajax.open('POST', localBaseAPIURL + '/auth/signin-via-token');
    ajax.send({
      uid: uid
    });
  };
  let createBusinessFromGeotab = function () {
    let businessName = loggedInUser.firstName + ' ' + loggedInUser.lastName;
    let businessDetails = {
      'persona': {
        'businessName': businessName,
        'tradingName': businessName,
        'abn': 'string',
        'businessAddress': loggedInUser.authorityAddress,
        'contactUserName': loggedInUser.name,
        'contactEmail': loggedInUser.name,
        'contactPhoneNumber': loggedInUser.phoneNumber
      },
      'isActive': true,
      'isExternal': true,
      'firebaseBusinessId': 'string',
      'demoOption': 'NO_DEMO'
    };
    console.log('business-body', businessDetails);
    ajax.onload = function () {
      console.log('login status:', ajax.status);
      console.log('login response', ajax.response);
      console.log('business created');
      console.log('localBaseLogmasterURL + mainLogmasterURI', localBaseLogmasterURL + mainLogmasterURI);
      document.getElementById('logmaster-main-iframe').src = localBaseLogmasterURL + mainLogmasterURI;
      finishCallback();
    };
    ajax.responseType = 'json';
    ajax.open('POST', baseAPIURL + '/business');
    ajax.setRequestHeader('Authorization', 'Bearer ' + mainParentAccessToken);
    ajax.send();
  };
  let syncLoggedInUserAndVehiclesToLogmaster = function () {
    loginUsingUID(mainParentUID,createBusinessFromGeotab);
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
          finishCallback();
        }
      } else {
        console.log('no groups found');
        finishCallback();
      }
    });
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
          finishCallback();
        } else {
          loggedInUser = result[0];
          console.log('logged in user', loggedInUser);
          if (loggedInUser.companyGroups.length > 0) {
            getGroupOfLoggedInUser(loggedInUser.companyGroups[0].id);
          } else {
            console.log('logged in user does not belong to a group');
            finishCallback();
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
      if (freshState.translate) {
        freshState.translate(elAddin || '');
      }

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

      // getting the current user to display in the UI
      freshApi.getSession(session => {
        elAddin.querySelector('#logmasterEwd2-user').textContent = session.userName;
      });


      elAddin.className = '';
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
      elAddin.className += ' hidden';
    }
  };
};
