import { BASE_URL } from './config.js';

// 디버그 로그 함수
function debugLog(message) {
    console.log(`[DEBUG] ${message}`);
}

// 로그인 폼 제출 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM Content Loaded');

    // URL에서 query parameter로 redirect 값 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/';  // 기본값으로 '/' 설정

    // hidden input에 redirect 값 설정
    const redirectInput = document.querySelector('input[name="redirectUrl"]');
    if (redirectInput) {
        redirectInput.value = redirectUrl;
        debugLog(`Redirect URL set to: ${redirectUrl}`);
    } else {
        console.error('Redirect input not found');
    }

    const loginForm = document.querySelector('.tp-login-input-form');
    if (loginForm) {
        debugLog('Login form found');
        loginForm.addEventListener('submit', handleLogin);
        debugLog('Submit event listener added to login form');
    } else {
        console.error('Login form not found');
    }

    // tp-btn-inner 클래스를 가진 버튼에 대한 클릭 이벤트 리스너 추가
    const signInButton = document.querySelector('.tp-btn-inner');
    if (signInButton) {
    debugLog('Sign In button (tp-btn-inner) found');
    signInButton.addEventListener('click', function(event) {
            debugLog('Sign In button (tp-btn-inner) clicked');
            event.preventDefault();
            handleLogin(event);
    });
    } else {
    console.error('Sign In button (tp-btn-inner) not found');
    }
});

// 로그인 처리 함수
async function handleLogin(event) {
    event.preventDefault();
    debugLog('Login handler called');

    const emailInput = document.querySelector('input[placeholder="이메일 입력"]');
    const passwordInput = document.querySelector('input[placeholder="비밀번호 입력"]');
    const redirectInput = document.querySelector('input[name="redirectUrl"]');

    if (!emailInput || !passwordInput) {
        console.error('Email or password input not found');
    return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;
    const redirectUrl = redirectInput.value || '/'; // 기본값으로 '/' 설정

    debugLog(`Attempting login with email: ${email}`);

    try {
    debugLog('Sending login request');
    const response = await fetch(`${BASE_URL}/accounts/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
    });

    debugLog(`Response status: ${response.status}`);
    const data = await response.json();
    debugLog(`Response data: ${JSON.stringify(data)}`);

    if (response.ok) {
            setCookie('access', data.access, 1);
            setCookie('refresh', data.refresh, 1);
            showMessage('로그인 성공!', 'success');
            debugLog('Login successful');
            setTimeout(() => {
                window.location.href = redirectUrl;  // 로그인 성공 후 redirectUrl로 이동
        }, 1000);
    } else {
        showMessage(data.detail || '로그인 실패. 다시 시도해주세요.', 'error');
        debugLog('Login failed');
    }
    } catch (error) {
        console.error('로그인 중 오류 발생:', error);
        showMessage('서버 오류가 발생했습니다. 나중에 다시 시도해주세요.', 'error');
        debugLog(`Error during login: ${error.message}`);
    }
}

// // 쿠키 설정 함수
// function setCookie(name, value, hours) {
//     const d = new Date();
//     d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
//     const expires = `expires=${d.toUTCString()}`;
//     document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Strict`;
// }

function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
    // Secure; SameSite 옵션 제거 후 테스트
}

// 메시지 표시 함수
function showMessage(message, type) {
    const messageContainer = document.createElement('div');
    messageContainer.textContent = message;
    messageContainer.style.padding = '10px';
    messageContainer.style.margin = '10px 0';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.textAlign = 'center';

if (type === 'success') {
        messageContainer.style.backgroundColor = '#d4edda';
        messageContainer.style.color = '#155724';
    } else {
        messageContainer.style.backgroundColor = '#f8d7da';
        messageContainer.style.color = '#721c24';
    }

    const form = document.querySelector('.tp-login-input-form');
    form.parentNode.insertBefore(messageContainer, form);

    // 5초 후 메시지 제거
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}