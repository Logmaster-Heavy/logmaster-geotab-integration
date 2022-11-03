import { ajaxInit } from './ajax/ajax-helper';
import { METHODS } from './constants/method-constants';


/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (api, state) {
  'use strict';

  // the root container
  // var elAddin = document.getElementById('logmasterEwd2');
  let mainLogmasterURI = document.getElementById('mainLogmasterURI').value;

  //change this when deploying to staging/prod
  let mainParentUID = '6j0VG2eTE6QIPhtsQyu5dihAiA42';
  let contractDurationMongoId = '62bbcada9b8c495a93347323';
  let billingPeriodMongoId = '62bbcada9b8c495a93347319';
  let mainParentAccessToken;
  let mainPartnerDetails;
  let mainBusinessContractDetails = {
    'billingPeriodId': billingPeriodMongoId,
    'businessMongoId': '',
    'businessModulesDto': [],
    'contractDurationId': contractDurationMongoId,
    'contractDurationYears': 0,
    'contractAccepted': true
  };


  let devBaseLogmasterURL = 'http://localhost:8080';
  let devBaseAPIURL = 'http://localhost:3005';

  // let prodBaseLogmasterURL = 'https://logmaster.au';
  // let prodBaseLogmasterAPIURL = 'https://prod-api.logmaster.au'

  let prodBaseLogmasterURL = 'https://logmaster-aus-sandbox-z626q6mhla-ts.a.run.app';
  let prodBaseLogmasterAPIURL = 'https://logmaster-portal-navigation-z626q6mhla-ts.a.run.app'


  let loggedInUser;
  let loggedInUserVehicles;

  let finishCallback;

  let defaultPassword = 'Password1!';

  let loggedInBusiness;
  
  let businessUID;

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
  let getBusinessUIDFromWebProfile = function () {

  };
  let displayLogmasterUILastStep = function () {
    console.log('baseLogmasterURL + mainLogmasterURI', getBaseLogmasterURL() + mainLogmasterURI);
    document.getElementById('logmaster-main-iframe').src = getBaseLogmasterURL() + mainLogmasterURI;
    finishCallback();
  };
  let createBusinesPassword = function () {
    let passwordPayload = {
      'password': defaultPassword,
      'confirmPassword': defaultPassword
    };
    ajaxInit(METHODS.PATCH, getBaseLogmasterAPIURL() + '/business/create-password/' + loggedInBusiness._id,
      function () {
        //onload
        console.log('password created');
        checkBusinessEmailAlreadyExists();
      },
      function () {
        console.log('error create password', this.response);
        displayLogmasterUILastStep();
      })
      .send(JSON.stringify(passwordPayload));
  };
  let checkBusinessEmailAlreadyExists = function () {
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business/find-by-email',
      function () {
        //on load
        console.log('checking business existence', this.response);
        if(this.response.success){
          loggedInBusiness = this.response.data;
          console.log('business already created', loggedInBusiness);
          /**
           * Set cookie business.uid 
           * name of cookie: geotab-login-uid
           * sa portal-v2 page, kukunin yung cookie na yun, para auto login
           * tapos redirect sa bagong page ex: Business -> Driver page
           * yung laman ng Business driver page are Drivers under sa nakalogin na user
           * update Readme
           */
          displayLogmasterUILastStep();
        } else {
          createBusinessFromGeotab();
        }
      }, 
      function () {

      },
      mainParentAccessToken)
      .send(JSON.stringify({
        emailAddress: loggedInUser.name
      }));
  };
  let createBusinessFromGeotab = function () {
    let businessName = loggedInUser.firstName + ' ' + loggedInUser.lastName;
    let businessDetails = {
      persona: {
        businessName: businessName.trim(),
        abn: '12341234',
        businessAddress: loggedInUser.authorityAddress.trim() || 'Geotab Business Address',
        contactUserName: loggedInUser.name.trim(),
        contactEmail: loggedInUser.name.trim(),
        contactPhoneNumber: loggedInUser.phoneNumber.trim()
      },
      supportEmail: loggedInUser.name.trim(),
      isActive: true,
      demoOption: 'NO_DEMO',
      geoTabId: loggedInUser.id.trim()
    };
    console.log('business-body', businessDetails);
    let onLoadFunc = function () {
      if(this.status == 201){
        console.log('business created');
        loggedInBusiness = this.response.data;
        createBusinesPassword();
      } else{
        console.log('error in business create', this.response);
        displayLogmasterUILastStep();
      }
    };
    let onErrorFunc = function () {
      // handle non-HTTP error (e.g. network down)
      console.log('non http error', this.response);
      displayLogmasterUILastStep();
    };
    ajaxInit(METHODS.POST, getBaseLogmasterAPIURL() + '/business', 
      onLoadFunc, 
      onErrorFunc, 
      mainParentAccessToken)
      .send(JSON.stringify(businessDetails).trim());
  };
  let getStandardPricingDetails = function () {
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/standard-pricing/find-all-active-rrp-to-business/' + mainPartnerDetails._id, 
      function () {
        //on load
        let standardPricingFetched = this.response.data;
        console.log('standard-pricing fetched', standardPricingFetched);
      }, 
      function () {

      },
      mainParentAccessToken)
      .send();
  };
  let getPartnerDetails = function () {
    ajaxInit(METHODS.GET, getBaseLogmasterAPIURL() + '/partner/find-one-by-uid/' + mainParentUID, 
      function () {
        // onload
        mainPartnerDetails = this.response.data;
        console.log('parnter details fetched', mainPartnerDetails);
        checkBusinessEmailAlreadyExists();
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
      mainParentAccessToken = this.response.data.accessToken;
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
  let syncLoggedInUserAndVehiclesToLogmaster = function () {
    loginUsingUID(mainParentUID, getPartnerDetails);
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
