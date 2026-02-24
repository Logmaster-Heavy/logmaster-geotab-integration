/**
 * @param {string} method - HTTP method (GET, POST, PATCH, etc.)
 * @param {string} url - Request URL
 * @param {*} data - Request body (null if not needed)
 * @param {string|null} bearerToken - Optional Bearer token
 * @returns {Promise<object>} Parsed JSON response
 */
export async function ajaxFetch(method, url, data = null, bearerToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };
  if (bearerToken) {
    headers['Authorization'] = 'Bearer ' + bearerToken;
  }
  const request = {
    method,
    headers,
  };
  if (data) {
    request.body = JSON.stringify(data);
  }
  const response = await (await fetch(url, request)).json();
  if (response.error) {
    if (response.message && response.message.length > 0) {
      throw response.message.pop();
    }
    throw new Error('Request failed');
  }
  return response;
}
