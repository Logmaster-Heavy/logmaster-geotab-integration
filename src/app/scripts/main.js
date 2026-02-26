import { getOrgUsersByEmail, postGeotabConsent } from './api/logmaster';
import { canUserAddServiceAccount, getServiceAccounts, getUsers } from './api/geotab';
import {
  api,
  loggedInUser,
  mainLogmasterURI,
  setAPI,
  setFinishCallback,
  setLoggedInUser,
  setMainLogmasterURI,
  setServerName,
  setDatabaseName,
  setSelectedOrgUser,
  finishCallback,
} from './core/state';
import { renderIframe, displayLogmasterUILastStep } from './ui/iframe';
import { showConsentModal } from './ui/consentModal';
import { showErrorMessage } from './ui/errorMessage';

/**
 * @returns {{initialize: Function, focus: Function, blur: Function, startup; Function, shutdown: Function}}
 */
geotab.addin.logmasterEwd2 = function (mainGeotabAPI, state) {
  'use strict';

  let checkServiceAccountAndConsent = () => {
    getServiceAccounts(api, (err, users) => {
      if (err) {
        console.log('[Add-In] getServiceAccounts error, showing consent modal:', err);
      }
      
      if (users && users.length > 0) {
        displayLogmasterUILastStep();
      } else {
        finishCallback();
        if (!canUserAddServiceAccount(loggedInUser)) {
          showErrorMessage(
            () => window.location.reload(),
            'You need an Administrator or Supervisor to consent to creation of a service account. Please ask a supervisor to open this add-in.'
          );
          return;
        }
        showConsentModal(() => {
          const userGroups = loggedInUser.companyGroups || [];
          const firstGroup = userGroups[0];
          const groupId = firstGroup && (firstGroup.id || firstGroup);
          return new Promise((resolve, reject) => {
            api.getSession((credentials, server) => {
              postGeotabConsent(credentials, server, groupId)
                .then(() => {
                  displayLogmasterUILastStep();
                  resolve();
                })
                .catch((err) => {
                  console.log('[Add-In] postGeotabConsent error:', err);
                  finishCallback();
                  showErrorMessage(() => window.location.reload(), 'Unable to create service account. Please try again or contact Logmaster support.');
                  reject(err);
                });
            });
          });
        });
      }
    });
  };

  let checkIfUserLoggedInRecently = async () => {
    const { name: userEmail, companyName } = loggedInUser;
    try {
      const response = await getOrgUsersByEmail(userEmail);
      const orgUsers = response.data;
      const companyNorm = String(companyName || '').trim().toLowerCase();
      const matchByCompany = orgUsers.find((ou) => {
        if (!ou.orgId || !ou.orgId.name) return false;
        const orgNameNorm = String(ou.orgId.name).trim().toLowerCase();
        if (!companyNorm || !orgNameNorm) return false;
        return orgNameNorm.includes(companyNorm) || companyNorm.includes(orgNameNorm);
      });
      console.log('[Add-In] Geotab company name:', companyName);
      console.log(
        '[Add-In] Logmaster company name:',
        matchByCompany && matchByCompany.orgId && matchByCompany.orgId.name
      );
      const selectedOrgUser = matchByCompany || orgUsers[0];

      console.log('[Add-In] Logmaster org user:', selectedOrgUser && selectedOrgUser._id || 'no user found');
      if (selectedOrgUser) {
        setSelectedOrgUser(selectedOrgUser);
      }
      checkServiceAccountAndConsent();
    } catch (error) {
      console.log(
        '[Add-In] checkIfUserLoggedInRecently: error fetching user from logmaster',
        error
      );
      finishCallback();
      showErrorMessage(() => window.location.reload());
    }
  };

  let getLoggedInUser = function () {
    api.getSession(function (session, server) {
      getUsers(api, function (err, users) {
        if (err) {
          console.log('[Add-In] getUsers error:', err);
          finishCallback();
          showErrorMessage(() => window.location.reload(), 'Failed to load users. Please try again or contact Logmaster support.');
          return;
        }
        const { userName, database } = session;
        const loggedInUser = users.find((user) => user.name === userName);
        setLoggedInUser(loggedInUser);
        setServerName(server);
        setDatabaseName(database);
        checkIfUserLoggedInRecently();
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
      if (currentSRC != mainLogmasterURI) {
        renderIframe();
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
