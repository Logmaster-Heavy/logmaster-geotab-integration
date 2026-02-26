import axios from 'axios';
import { baseAPIURL } from '../core/state';

function checkError(result) {
  if (result.error) {
    if (result.message && result.message.length > 0) {
      throw result.message.pop();
    }
    throw new Error('Request failed');
  }
}

/**
 * Gets organization users by email from Logmaster.
 *
 * @param {string} userEmail - User email to look up.
 * @returns {Promise<object>} API response with data (org users array).
 */
export async function getOrgUsersByEmail(userEmail) {
  const { data } = await axios.get(`${baseAPIURL}/organization/user/email/${userEmail}`);
  checkError(data);
  return data;
}

/**
 * Sends Geotab consent to Logmaster and creates a service account. The BE verifies the Geotab session,
 * stores consent, and creates the service account. Waits for the full response before resolving.
 *
 * @param {object} credentials - Geotab credentials from getSession { database, userName, sessionId }.
 * @param {string} server - Geotab server URL.
 * @param {string} [groupId] - Logged-in user's first group id.
 * @returns {Promise<object>} API response.
 */
export async function postGeotabConsent(credentials, server, groupId) {
  const body = {
    database: credentials.database,
    server,
    userName: credentials.userName,
    sessionId: credentials.sessionId,
    groupId: groupId || undefined,
  };
  const { data } = await axios.post(`${baseAPIURL}/user-consent/geotab`, body);
  checkError(data);
  return data;
}
