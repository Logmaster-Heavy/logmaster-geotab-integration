/**
 * 
 * @param {*} method 
 * @param {*} url 
 * @param {*} onLoadFunc 
 * @param {*} onErrorFunc 
 * @param {*} bearerToken null by default, if has value then it will attach it as Authorization Bearer Token 
 * @returns ajax instance
 */
export function ajaxInit(method, url, onLoadFunc, onErrorFunc, bearerToken) {
    const ajax = new XMLHttpRequest();
    ajax.onload = onLoadFunc;
    ajax.onerror = onErrorFunc;
    ajax.open(method, url);
    ajax.responseType = 'json';
    ajax.setRequestHeader('Content-type', 'application/json');
    ajax.setRequestHeader('Accept', 'application/json, text/plain, */*');
    if(bearerToken){
        ajax.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    }
    return ajax;
};