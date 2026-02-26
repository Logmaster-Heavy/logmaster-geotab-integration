/**
 * Geotab API call wrappers. Each function accepts the Geotab API object and a callback.
 *
 * @param {object} geotabApi - The Geotab API object for making calls.
 * @param {function} callback - Node-style (error, result) callback.
 */

/**
 * Gets all users in the current database.
 *
 * @param {object} geotabApi - The Geotab API object.
 * @param {function} callback - (error, users) - users is an array of User entities.
 */
export function getUsers(geotabApi, callback) {
  geotabApi.call(
    'Get',
    {
      typeName: 'User',
      search: { name: null },
    },
    (users) => callback(null, users || []),
    (error) => callback(error, [])
  );
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
 * @param {function} callback - (error, users) - users is an array of service account User entities.
 */
export function getServiceAccounts(geotabApi, callback) {
  geotabApi.call(
    'Get',
    {
      typeName: 'User',
      search: {
        authenticationTypes: ['ServiceAccount'],
        name: SERVICE_ACCOUNT_NAME_PATTERN,
      },
    },
    (users) => callback(null, users || []),
    (error) => callback(error, [])
  );
}
