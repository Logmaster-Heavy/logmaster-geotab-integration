/**
 * Geotab API call wrappers. Each function accepts the Geotab API object and returns a Promise.
 *
 * @param {object} geotabApi - The Geotab API object for making calls.
 */

/**
 * Gets the current session and server from Geotab.
 *
 * @param {object} geotabApi - The Geotab API object.
 * @returns {Promise<{session: object, server: string}>}
 */
export function getSession(geotabApi) {
  return new Promise((resolve) => {
    geotabApi.getSession((session, server) => resolve({ session, server }));
  });
}

/**
 * Gets all users in the current database.
 *
 * @param {object} geotabApi - The Geotab API object.
 * @returns {Promise<object[]>} Array of User entities.
 */
export function getUsers(geotabApi) {
  return new Promise((resolve, reject) => {
    geotabApi.call(
      'Get',
      {
        typeName: 'User',
        search: { name: null },
      },
      (users) => resolve(users || []),
      (error) => reject(error)
    );
  });
}

const SERVICE_ACCOUNT_NAME_PATTERN = 'service.account@logmaster';

const ALLOWED_SECURITY_GROUP_IDS = ['GroupEverythingSecurityId', 'GroupSupervisorSecurityId'];

/**
 * Returns true if the user has Administrator or Supervisor clearance (can add service accounts).
 * Checks user.securityGroups for id matching GroupEverythingSecurityId or GroupSupervisorSecurityId.
 *
 * @param {object} user - Geotab User entity (with securityGroups array).
 * @returns {boolean}
 */
export function canUserAddServiceAccount(user) {
  const groups = user && user.securityGroups;
  if (!Array.isArray(groups) || groups.length === 0) return false;
  return groups.some((g) => {
    return ALLOWED_SECURITY_GROUP_IDS.includes(g.id);
  });
}

/**
 * Gets service account users in the current database (by name pattern service.account@logmaster*).
 *
 * @param {object} geotabApi - The Geotab API object.
 * @returns {Promise<object[]>} Array of service account User entities.
 */
export function getServiceAccounts(geotabApi) {
  return new Promise((resolve, reject) => {
    geotabApi.call(
      'Get',
      {
        typeName: 'User',
        search: {
          authenticationTypes: ['ServiceAccount'],
          name: SERVICE_ACCOUNT_NAME_PATTERN,
        },
      },
      (users) => resolve(users || []),
      (error) => reject(error)
    );
  });
}
