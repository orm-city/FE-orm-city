import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();

// 사용자 역할을 한글로 변환하는 함수
function formatUserRole(role) {
    const roleMap = {
        'admin': '관리자',
        'student': '학생',
    };
    
    return roleMap[role] || role; // 매핑되지 않은 역할은 그대로 반환
}

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
             <span>${formatUserRole(userInfo.role)}</span>
        </div>`;

        headerUserInfo.innerHTML += infoItem;
    } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', fetchUserInfo);