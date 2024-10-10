export function getAccessToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        console.log('Checking cookie:', name, value);
        if (name === 'access') {
            console.log('Access token found:', value);
            return decodeURIComponent(value);
        }
    }
    console.log('Access token not found in cookies');
    return null;
}

// export function getCookie(name) {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//         const [cookieName, cookieValue] = cookie.trim().split('=');
//         if (cookieName === name) {
//             return decodeURIComponent(cookieValue);
//         }
//     }
//     return null;
// }