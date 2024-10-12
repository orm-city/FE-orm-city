import { BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 폼 데이터 수집
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            username: formData.get('name'), 
            password: formData.get('password'),
            nickname: formData.get('nickname')
        };

        console.log('전송할 데이터:', data);  // 디버깅: 전송할 데이터 로그

        // API 요청
        fetch(`${BASE_URL}/accounts/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            console.log('응답 상태:', response.status);
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.log('응답 텍스트:', text);
                    throw new Error('JSON 파싱 실패');
                }
            });
        })
        .then(result => {
            console.log('서버 응답:', result);
            if (result.user) {
                showMessage('회원가입이 완료되었습니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/';  // 로그인 성공 후 redirectUrl로 이동
            }, 1000);
            } else {
                showMessage('회원가입 실패: ' + (result.message || '알 수 없는 오류'), 'error');
            }
        })
        .catch(error => {
            console.error('에러:', error);
            showMessage('회원가입 중 오류가 발생했습니다.', 'error');
        });
    });
});

function showMessage(message, type) {
    // 메시지 표시 로직 (이전과 동일)
    console.log(`${type.toUpperCase()} 메시지:`, message);
}