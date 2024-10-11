import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();
async function fetchUserInfo() {
    try {
        if (!accessToken) {
            console.log('액세스 토큰이 없습니다. 로그인이 필요합니다.');
            return { isLoggedIn: false };
        }

        const response = await fetch(`${BASE_URL}/accounts/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const userInfo = await response.json();

        const headerUserInfo = document.getElementById('headerUserInfo');
        headerUserInfo.innerHTML = '';
        const infoItem = `
        <div class="tp-header-user-profile-content" id="headerUserInfo">
            <h4>${userInfo.username}</h4>
            <span>${userInfo.role}</span>
        </div>`;

        headerUserInfo.innerHTML += infoItem;
    } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', fetchUserInfo);