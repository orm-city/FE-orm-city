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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userInfo = await response.json();
        console.log('Received user info:', userInfo);

        populateForm(userInfo);
    } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
        showError('사용자 정보를 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
    }
}

function populateForm(userInfo) {
    const form = document.getElementById('profileForm');
    form.elements['username'].value = userInfo.username || '';
    form.elements['email'].value = userInfo.email || '';
    form.elements['nickname'].value = userInfo.nickname || '';
}

async function updateUserInfo(event) {
    event.preventDefault();
    
    const form = event.target;
    const updatedInfo = {
        username: form.elements['username'].value,
        nickname: form.elements['nickname'].value,
    };

    try {
        const response = await fetch(`${BASE_URL}/accounts/profile/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedInfo)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('User info updated:', result);
        showSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
        console.error('사용자 정보 업데이트에 실패했습니다:', error);
        showError('프로필 업데이트에 실패했습니다. 다시 시도해 주세요.');
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    successElement.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Fetching user info...');
    fetchUserInfo();

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', updateUserInfo);
});