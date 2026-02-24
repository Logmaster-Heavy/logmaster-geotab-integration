export function setCookie(cname, cvalue, exdays) {
  let expires = '';
  if (exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    expires = ';expires=' + d.toUTCString();
  }
  const cookie =
    cname +
    '=' +
    encodeURIComponent(cvalue) +
    expires +
    ';path=/;samesite=None;secure=true';
  document.cookie = cookie;
}

export function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

export function deleteCookie(cname) {
  document.cookie =
    cname +
    '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;samesite=None;secure=true';
}
