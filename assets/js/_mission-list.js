// missions.js
import { BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", async () => {
    const accessToken = getCookie('access');
    if (!accessToken) {
        handleNotLoggedIn();
        return;
    }

    const currentUrl = window.location.pathname; // 예: /major/7/1/mid
    const urlParts = currentUrl.split('/');
    const majorId = urlParts[2]; // URL에서 major ID 추출
    const minorId = urlParts[3]; // URL에서 minor ID 추출
    const midOrFinal = urlParts[4]; // URL에서 mid 또는 final 추출

    const mcqApiUrl = buildApiUrl(majorId, minorId, midOrFinal, "mcqs");
    const csApiUrl = buildApiUrl(majorId, minorId, midOrFinal, "cs");

    try {
        const mcqData = await fetchMissionData(mcqApiUrl, accessToken);
        const csData = await fetchMissionData(csApiUrl, accessToken);
        renderMissionData(mcqData, csData, majorId, minorId, midOrFinal);
    } catch (error) {
        console.error('미션 로드 중 오류 발생:', error);
    }
});

// 쿠키에서 특정 이름의 값을 가져오는 헬퍼 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 로그인이 안 되어 있을 때 처리하는 함수
function handleNotLoggedIn() {
    alert("먼저 로그인해야 합니다.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

// 미션 데이터를 가져오기 위한 API URL 생성 함수
function buildApiUrl(majorId, minorId, midOrFinal, missionType) {
    return `${BASE_URL}/missions/major/${majorId}/${minorId}/${midOrFinal}/${missionType}/`;
}

// API로부터 미션 데이터를 가져오는 함수
async function fetchMissionData(apiUrl, accessToken) {
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`API 요청 실패: 상태 코드 ${response.status}`);
    }

    return await response.json();
}

// HTML 컨테이너에 미션 데이터를 렌더링하는 함수
function renderMissionData(mcqData, csData, majorId, minorId, midOrFinal) {
    const container = document.getElementById("questions-container");
    container.innerHTML = ""; // 기존 내용을 초기화

    mcqData.forEach(mission => {
        const missionHtml = `
            <div class="tp-postbox-item p-relative mb-40">
                <div class="tp-postbox-item-list-box d-flex align-items-center">
                    <div class="tp-postbox-content">
                        <h3 class="tp-postbox-item-list-title"><a href="/major/${majorId}/${minorId}/${midOrFinal}/mcqs/${mission.id}">${mission.question}</a></h3>
                        <div class="tp-postbox-btn">
                            <a href="/major/${majorId}/${minorId}/${midOrFinal}/mcqs/${mission.id}">객관식 문제 풀러 가기 <span><svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 11L6.5 6L1.5 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg></span></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", missionHtml);
    });

    csData.forEach(mission => {
        const missionHtml = `
            <div class="tp-postbox-item p-relative mb-40">
                <div class="tp-postbox-item-list-box d-flex align-items-center">
                    <div class="tp-postbox-content">
                        <h3 class="tp-postbox-item-list-title"><a href="/major/${majorId}/${minorId}/${midOrFinal}/cs/${mission.id}">${mission.problem_statement}</a></h3>
                        <div class="tp-postbox-btn">
                            <a href="/major/${majorId}/${minorId}/${midOrFinal}/cs/${mission.id}">코드 제출 문제 풀러 가기 <span><svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 11L6.5 6L1.5 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg></span></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", missionHtml);
    });
}
