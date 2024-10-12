import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();


// 날짜 형식을 변경하는 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userInfo = await response.json();
        console.log('Received user info:', userInfo);  // 디버깅을 위한 로그

        const userProfileInfo = document.getElementById('userProfileInfo');
        if (!userProfileInfo) {
            console.error('userProfileInfo 요소를 찾을 수 없습니다.');
            return;
        }

        const infoItem = `
        <ul>
            <li>
                <div class="tp-profile-info d-flex">
                <div class="tp-profile-info-tag">
                    <span>가입일자</span>
                </div>
                <div class="tp-profile-info-details">
                    <span>${userInfo.date_joined ? formatDate(userInfo.date_joined) : 'N/A'}</span>
                </div>
                </div>
            </li>
            <li>
                <div class="tp-profile-info d-flex">
                <div class="tp-profile-info-tag">
                    <span>이름</span>
                </div>
                <div class="tp-profile-info-details">
                    <span>${userInfo.username || 'N/A'}</span>
                </div>
                </div>
            </li>
            <li>
                <div class="tp-profile-info d-flex">
                <div class="tp-profile-info-tag">
                    <span>닉네임</span>
                </div>
                <div class="tp-profile-info-details">
                    ${userInfo.nickname ? 
                        `<span>${userInfo.nickname}</span>` : 
                        `<span>미등록</span>
                        <a onclick="goToNicknameRegistration()" class="tp-btn" href="/edit-profile">등록하러 가기</a>`
                    }
                </div>
                </div>
            </li>
            <li>
                <div class="tp-profile-info d-flex">
                <div class="tp-profile-info-tag">
                    <span>이메일</span>
                </div>
                <div class="tp-profile-info-details">
                    <span>${userInfo.email || 'N/A'}</span>
                </div>
                </div>
            </li>
        </ul>`;

        userProfileInfo.innerHTML = infoItem;
        console.log('User profile info updated successfully');  // 디버깅을 위한 로그
    } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
        const userProfileInfo = document.getElementById('userProfileInfo');
        if (userProfileInfo) {
            userProfileInfo.innerHTML = '<p>사용자 정보를 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.</p>';
        }
        return null;
    }
}

// 닉네임 등록 페이지로 이동하는 함수
function goToNicknameRegistration() {
    // 여기에 닉네임 등록 페이지 URL을 입력하세요
    window.location.href = '/nickname-registration';
}

// DOM이 완전히 로드된 후에 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Fetching user info...');  // 디버깅을 위한 로그
    fetchUserInfo();
});

// 전역 스코프에서도 함수를 사용할 수 있도록 내보내기
window.fetchUserInfo = fetchUserInfo;
window.goToNicknameRegistration = goToNicknameRegistration;