import { BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = getCookie('access');
    if (!accessToken) {
        handleNotLoggedIn();
        return;
    }

    // 객관식 및 주관식 문제들을 모두 가져와 렌더링
    await fetchAndRenderQuestions(accessToken);
});

// 1. 쿠키에서 accessToken 추출 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 2. 로그인이 안 되어 있을 때 처리하는 함수
function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

// 3. 객관식 및 주관식 문제 API를 호출하고 렌더링
async function fetchAndRenderQuestions(accessToken) {
    try {
        // 객관식 문제 API 호출
        const mcqResponse = await fetch(`${BASE_URL}/missions/multiple-choice-questions/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // JWT 토큰을 헤더에 추가
            }
        });

        if (!mcqResponse.ok) {
            console.error(`객관식 API 요청 실패: 상태 코드 ${mcqResponse.status}`);
            return;
        }

        const mcqData = await mcqResponse.json();

        // 주관식 문제 API 호출
        const codeResponse = await fetch(`${BASE_URL}/missions/code-submissions/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // JWT 토큰을 헤더에 추가
            }
        });

        if (!codeResponse.ok) {
            console.error(`주관식 API 요청 실패: 상태 코드 ${codeResponse.status}`);
            return;
        }

        const codeData = await codeResponse.json();

        // 두 데이터 모두 렌더링
        renderQuestions(mcqData, codeData, accessToken);
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
    }
}

// 4. 받은 객관식 및 주관식 문제 데이터를 HTML로 변환하여 동적 추가
function renderQuestions(mcqQuestions, codeQuestions, accessToken) {
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = ''; // 기존 항목 초기화

    // 객관식 문제 렌더링
    mcqQuestions.forEach(question => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="tpd-table-row">
                <div class="tpd-quiz-info">
                    <h4 class="tpd-quiz-title">${question.question}</h4>
                </div>
                <div class="tpd-quiz-details">
                    <div class="tpd-quiz-details-box d-flex">
                        <div class="tpd-quiz-details-btn mr-15">
                            <a class="tpd-border-btn" href="/mcqs/${question.id}">Edit</a>
                        </div>

                        <div class="tpd-action-inexact-btn">
                            <button class="border-bg" data-mission-id="${question.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M12.9154 3.27502L12.4678 9.79134C12.3534 11.4562 12.2963 12.2887 11.8326 12.8871C11.6033 13.183 11.3082 13.4328 10.9659 13.6204C10.2736 14 9.34686 14 7.49346 14C5.63762 14 4.7097 14 4.0169 13.6197C3.67439 13.4317 3.37914 13.1816 3.14997 12.8852C2.68644 12.2857 2.63053 11.4521 2.51869 9.78488L2.08203 3.27502" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M14 3.27502H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M10.4282 3.275L9.9352 2.35962C9.60769 1.75157 9.44393 1.44754 9.16146 1.25792C9.0988 1.21586 9.03245 1.17845 8.96307 1.14606C8.65027 1 8.27486 1 7.52404 1C6.75437 1 6.36954 1 6.05154 1.15218C5.98107 1.18591 5.91382 1.22483 5.85048 1.26856C5.56473 1.46586 5.40511 1.78101 5.08588 2.41132L4.64844 3.275" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M5.69336 10.425L5.69336 6.52505" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M9.30469 10.425L9.30469 6.52502" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 삭제 버튼 클릭 이벤트 핸들러 추가
        const deleteButton = li.querySelector('.border-bg');
        deleteButton.addEventListener('click', () => deleteMission(question.id, 'mcq', li, accessToken));

        missionList.appendChild(li);
    });

    // 주관식 문제 렌더링
    codeQuestions.forEach(problem => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="tpd-table-row">
                <div class="tpd-quiz-info">
                    <h4 class="tpd-quiz-title">${problem.problem_statement}</h4>
                </div>
                <div class="tpd-quiz-details">
                    <div class="tpd-quiz-details-box d-flex">
                        <div class="tpd-quiz-details-btn mr-15">
                            <a class="tpd-border-btn" href="/code-submissions/${problem.id}">Edit</a>
                        </div>
                        <div class="tpd-action-inexact-btn">
                            <button class="border-bg" data-mission-id="${problem.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M12.9154 3.27502L12.4678 9.79134C12.3534 11.4562 12.2963 12.2887 11.8326 12.8871C11.6033 13.183 11.3082 13.4328 10.9659 13.6204C10.2736 14 9.34686 14 7.49346 14C5.63762 14 4.7097 14 4.0169 13.6197C3.67439 13.4317 3.37914 13.1816 3.14997 12.8852C2.68644 12.2857 2.63053 11.4521 2.51869 9.78488L2.08203 3.27502" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M14 3.27502H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M10.4282 3.275L9.9352 2.35962C9.60769 1.75157 9.44393 1.44754 9.16146 1.25792C9.0988 1.21586 9.03245 1.17845 8.96307 1.14606C8.65027 1 8.27486 1 7.52404 1C6.75437 1 6.36954 1 6.05154 1.15218C5.98107 1.18591 5.91382 1.22483 5.85048 1.26856C5.56473 1.46586 5.40511 1.78101 5.08588 2.41132L4.64844 3.275" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M5.69336 10.425L5.69336 6.52505" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M9.30469 10.425L9.30469 6.52502" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // 삭제 버튼 클릭 이벤트 핸들러 추가
        const deleteButton = li.querySelector('.border-bg');
        deleteButton.addEventListener('click', () => deleteMission(problem.id, 'code', li, accessToken));

        missionList.appendChild(li);
    });
}

// 5. 미션 삭제 함수
async function deleteMission(missionId, missionType, missionElement, accessToken) {
    const confirmed = confirm("정말로 이 미션을 삭제하시겠습니까?");
    if (!confirmed) {
        return;
    }

    let deleteUrl = '';
    if (missionType === 'mcq') {
        deleteUrl = `${BASE_URL}/missions/multiple-choice-questions/${missionId}/`;
    } else if (missionType === 'code') {
        deleteUrl = `${BASE_URL}/missions/code-submissions/${missionId}/`;
    } else {
        alert("잘못된 미션 타입입니다.");
        return;
    }

    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // JWT 토큰을 헤더에 추가
            }
        });

        if (response.ok) {
            alert("미션이 삭제되었습니다.");
            missionElement.remove(); // DOM에서 해당 항목 삭제
        } else {
            alert("미션 삭제에 실패했습니다.");
            console.error(`API 요청 실패: 상태 코드 ${response.status}`);
        }
    } catch (error) {
        console.error("미션 삭제 중 오류 발생:", error);
        alert("미션 삭제 중 오류가 발생했습니다.");
    }
}
