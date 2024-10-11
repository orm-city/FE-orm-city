import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();

function updateLoginStatusBar() {
    const loginStatusBar = document.getElementById('loginStatusBar');
    
    if (accessToken) {
        // 로그인 상태일 경우 (기존 버튼 유지)
        loginStatusBar.innerHTML = '<button><img src="/assets/img/login/orm-user.png" alt=""></button>';
    } else {
        // 로그인 상태가 아닐 경우
        loginStatusBar.innerHTML = '<a class="tp-btn-inner" href="/login">Login</a>';
    }
}

// 페이지 로드 시 로그인 상태 바 업데이트
document.addEventListener('DOMContentLoaded', updateLoginStatusBar);