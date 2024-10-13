import { BASE_URL } from './config.js';

const accessToken = getCookie('access');
if (!accessToken) {
    handleNotLoggedIn();
}

// URL에서 id 값을 추출하는 함수
function getQuestionIdFromUrl() {
    const urlParts = window.location.pathname.split('/');
    return urlParts.length === 3 ? urlParts[2] : null;
}

document.addEventListener('DOMContentLoaded', async function() {
    const questionId = getQuestionIdFromUrl();

    // 미션 목록을 불러와서 선택 옵션에 추가
    try {
        const missionApiUrl = `${BASE_URL}/missions/`;
        const response = await fetch(missionApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error("Minor category API 요청 실패");
        }

        const data = await response.json();
        const dropdown = document.querySelector('#missionlist select');
        if (dropdown) {
            dropdown.style.display = ''; 
            dropdown.innerHTML = '<option value="">선택하세요</option>'; 
            data.forEach(mission => {
                const optionElement = document.createElement('option');
                optionElement.value = mission.id;
                optionElement.textContent = `id: ${mission.id} | ${mission.title}`;
                dropdown.appendChild(optionElement);
            });
        }
    } catch (error) {
        console.error("Minor category 데이터 로드 중 오류 발생:", error);
    }

    if (questionId) {
        // 문제 편집 모드 - 해당 문제의 데이터를 불러와서 폼을 채워줌
        try {
            const questionApiUrl = `${BASE_URL}/missions/multiple-choice-questions/${questionId}/`;
            const response = await fetch(questionApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error("문제 데이터를 불러오지 못했습니다.");
            }

            const questionData = await response.json();

            // 폼에 문제 데이터 채우기
            document.querySelector('#missionlist select').value = questionData.mission;
            document.querySelector('#question').value = questionData.question;
            document.querySelector('#option_1').value = questionData.option_1;
            document.querySelector('#option_2').value = questionData.option_2;
            document.querySelector('#option_3').value = questionData.option_3;
            document.querySelector('#option_4').value = questionData.option_4;
            document.querySelector('#option_5').value = questionData.option_5;
            document.querySelector('#correct_option').value = questionData.correct_option;

            // 제출 버튼 텍스트를 "수정하기"로 변경
            document.querySelector('#create-question-btn').textContent = "수정하기";
        } catch (error) {
            console.error("문제 데이터를 불러오는 중 오류 발생:", error);
        }
    }

    // 문제 생성 또는 수정 버튼 이벤트 리스너 등록
    const createQuestionButton = document.querySelector('#create-question-btn');
    if (createQuestionButton) {
        createQuestionButton.addEventListener('click', async function(event) {
            event.preventDefault();

            // 폼 데이터 수집
            const missionId = document.querySelector('#missionlist select').value;
            const question = document.querySelector('#question').value;
            const option1 = document.querySelector('#option_1').value;
            const option2 = document.querySelector('#option_2').value;
            const option3 = document.querySelector('#option_3').value;
            const option4 = document.querySelector('#option_4').value;
            const option5 = document.querySelector('#option_5').value;
            const correctOption = document.querySelector('#correct_option').value;

            const requestData = {
                mission: parseInt(missionId),
                question: question,
                option_1: option1,
                option_2: option2,
                option_3: option3,
                option_4: option4,
                option_5: option5,
                correct_option: parseInt(correctOption)
            };

            try {
                let apiUrl;
                let method;
                if (questionId) {
                    // 문제 수정 API 요청
                    apiUrl = `${BASE_URL}/missions/multiple-choice-questions/${questionId}/`;
                    method = 'PUT';
                } else {
                    // 문제 생성 API 요청
                    apiUrl = `${BASE_URL}/missions/multiple-choice-questions/`;
                    method = 'POST';
                }

                const response = await fetch(apiUrl, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(questionId ? "문제 수정 요청 실패" : "문제 생성 요청 실패");
                }

                alert(questionId ? "문제가 성공적으로 수정되었습니다." : "문제가 성공적으로 생성되었습니다.");
            } catch (error) {
                console.error(questionId ? "문제 수정 중 오류 발생:" : "문제 생성 중 오류 발생:", error);
            }
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
