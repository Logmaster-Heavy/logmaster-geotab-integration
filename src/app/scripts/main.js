import { ajaxFetch } from './api/fetch';
import { getBaseLogmasterAPIURL } from './api/endpoints';
import { METHODS } from './constants/http-methods';
import {
  api,
  cookieMainURICname,
  cookieUidCname,
  loggedInUser,
  mainLogmasterURI,
  setAPI,
  setChildrenGroups,
  setCompanyGroups,
  setFinishCallback,
  setLoggedInUser,
  setMainLogmasterURI,
  setServerName,
  setDatabaseName,
} from './core/state';
import { changeIframeURI, displayLogmasterUILastStep } from './ui/iframe';
import { deleteCookie, getCookie, setCookie } from './utils/cookies';

/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let checkIfUserLoggedInRecently = async () => {
    try {
      const response = await ajaxFetch(
        METHODS.GET,
        getBaseLogmasterAPIURL() +
          '/organization/user/email/' +
          loggedInUser.name
      );

      const targetUidFromCookie = getCookie(cookieUidCname);
      console.log('targetUidFromCookie', targetUidFromCookie);

      if (targetUidFromCookie && targetUidFromCookie === response.data._id) {
        displayLogmasterUILastStep();
      } else {
        deleteCookie(cookieUidCname);
        setCookie(cookieUidCname, response.data._id, 0.008);
        displayLogmasterUILastStep();
      }
    } catch (error) {
      console.log(
        'checkIfUserLoggedInRecently: error fetching user from logmaster',
        error
      );
      displayLogmasterUILastStep();
    }
  };
  let getGroupOfLoggedInUser = function (groupId) {
    api.call(
      'Get',
      {
        typeName: 'Group',
        search: {
          id: groupId,
        },
      },
      function (fetchedGroup) {
        if (fetchedGroup.length === 0) {
          console.log('no groups found');
          displayLogmasterUILastStep();
          return;
        }

        const group = fetchedGroup[0];
        const { children, id } = group;
        const initChildrenGroups = children;
        initChildrenGroups.push({ id });
        setChildrenGroups(
          initChildrenGroups.map(function (child) {
            return { id: child.id };
          })
        );

        // Step #3 - Final
        checkIfUserLoggedInRecently();
      }
    );
  };
  let getLoggedInUser = function () {
    api.getSession(function (session, server) {
      api.call(
        'Get',
        {
          typeName: 'User',
          search: {
            name: null, // get all users
          },
        },
        async function (users) {
          const { userName, database } = session;
          const loggedInUser = users.find((user) => user.name === userName);
          setLoggedInUser(loggedInUser);
          setServerName(server);
          setDatabaseName(database);

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
        }
      );
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
    blur: function () {},
  };
};
