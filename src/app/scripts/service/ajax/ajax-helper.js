/**
 * 
 * @param {*} method 
 * @param {*} url 
 * @param {*} data default null, pass null if not needed
 * @param {*} bearerToken default null, pass null if not needed
 * @returns 
 */
export async function ajaxFetch(method, url, data = null, bearerToken = null) {
    let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
    };
    if(bearerToken){
        headers['Authorization'] = 'Bearer ' + bearerToken;
    }
    let request = {
        method: method,
        headers: headers
    };
    if(data){
        request['body'] = JSON.stringify(data);
    }
    const response = await (await fetch(url, request)).json();
    if(response.error){
        console.log('response.json()', response);
        if(response.message){
            if(response.message.length > 0){
                throw response.message.pop();
            }
        }
        throw error;
    }

    return response;
}