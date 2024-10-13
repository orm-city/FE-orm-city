import { BASE_URL } from './config.js';

const accessToken = getCookie('access');
if (!accessToken) {
    handleNotLoggedIn();
}

const questionId = location.pathname.split('/').pop();

document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = `${BASE_URL}/missions/multiple-choice-questions/${questionId}/`;

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
            // HTML 요소에 API 데이터 채우기
            const questionTextElement = document.getElementById("question-text");
            if (questionTextElement) {
                questionTextElement.innerText = data.question;
            }

            // 동적으로 옵션 라디오 버튼 생성 및 추가
            const optionsContainer = document.getElementById("options-container");
            if (optionsContainer) {
                optionsContainer.innerHTML = '';

                for (let i = 1; i <= 5; i++) {
                    if (data[`option_${i}`]) {
                        const optionElement = document.createElement("div");
                        optionElement.classList.add("option-item");

                        optionElement.innerHTML = `
                            <input type="radio" id="option-${i}" name="options" value="${i}">
                            <label for="option-${i}">${data[`option_${i}`]}</label>
                        `;

                        optionsContainer.appendChild(optionElement);
                    }
                }
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
                const newUrl = currentUrl.replace(/\/mcqs\/\d+$/, '').replace(/\/$/, '');
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
            const selectedOption = document.querySelector('input[name="options"]:checked');
            if (!selectedOption) {
                alert("옵션을 선택해주세요.");
                return;
            }

            const submissionData = {
                question: questionId,
                selected_option: parseInt(selectedOption.value)
            };

            fetch(`${BASE_URL}/missions/multiple-choice-questions/submit/`, {
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
                    const resultMessageElement = document.getElementById("result-message");
                    if (resultMessageElement) {
                        resultMessageElement.innerText = data.is_correct ? "정답입니다!" : "오답입니다.";
                    } else {
                        alert(data.is_correct ? "정답입니다!" : "오답입니다.");
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