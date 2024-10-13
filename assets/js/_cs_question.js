import { BASE_URL } from './config.js';

const accessToken = getCookie('access');
if (!accessToken) {
    handleNotLoggedIn();
}

const questionId = location.pathname.split('/').pop();

document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = `${BASE_URL}/missions/code-submission-questions/${questionId}/`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("API 요청 실패");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            // HTML 요소에 API 데이터 채우기
            const titleElement = document.querySelector('.tp-checkout-bill-title');
            const inputExampleContainer = document.querySelector("#inputexample");
            const outputExampleContainer = document.querySelector("#outputexample");
            console.log(titleElement);
            console.log(inputExampleContainer);
            console.log(outputExampleContainer);
            if (inputExampleContainer && outputExampleContainer && titleElement) {
                titleElement.innerText = data.problem_statement;
                inputExampleContainer.innerHTML = `<div class="example-box">
                <h4>입력 예시</h4>
                <h5>${data.example_input}</h5>
                </div>`;
                outputExampleContainer.innerHTML = `<div class="example-box">
                <h4>출력 예시</h4>
                <h5>${data.example_output}</h5>
                </div>`;
            }
        })
        .catch(error => {
            console.error("데이터 로드 중 오류 발생:", error);
        });

    // 이전 화면으로 돌아가는 버튼 이벤트 리스너 등록
    document.querySelectorAll('.tp-checkout-btn-wrapper a').forEach((button, index) => {
        if (button.textContent.trim() === '이전화면') {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const currentUrl = window.location.href;
                const newUrl = currentUrl.replace(/\/code-submission\/\d+$/, '').replace(/\/$/, '');
                window.location.href = newUrl;
            });
        }
    });
});

// 제출 버튼 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('.tp-checkout-btn');
    if (submitButton) {
        submitButton.addEventListener('click', function(event) {
            event.preventDefault();
            const codeTextarea = document.querySelector('textarea');
            if (!codeTextarea) {
                alert("코드를 입력해주세요.");
                return;
            }
            const submittedCode = codeTextarea.value;
            const submissionData = {
                code_submission_id: questionId,
                submitted_code: submittedCode
            };
            console.log(submissionData);

            fetch(`${BASE_URL}/missions/code-submissions/${questionId}/evaluate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(submissionData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("제출 실패");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    const resultMessageElement = document.getElementById("result-message");
                    if (resultMessageElement) {
                        resultMessageElement.innerText = `${data.message}
                        채점 결과: ${data.is_passed ? '성공' : '실패'}`;
                    } else {
                        alert(resultMessage);
                    }
                })
                .catch(error => {
                    console.error("제출 중 오류 발생:", error);
                });
        });
    }
});

// Access token을 쿠키에서 추출하는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 로그인이 안 되어 있을 때 처리하는 함수
function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}