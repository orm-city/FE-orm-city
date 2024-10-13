import { BASE_URL } from './config.js';

// 쿠키에서 accessToken 추출 함수 (JWT 토큰)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// 로그인 체크 및 리디렉션
function checkLogin() {
  const accessToken = getCookie('access');
  if (!accessToken) {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  return accessToken;
}

// 현재 페이지가 관리자인지 여부 확인
function isAdminPage() {
  return window.location.pathname.includes('/admin');
}

// API 요청을 보내 객관식 문제 데이터를 가져오는 함수
async function fetchMCQSubmissions() {
  const accessToken = checkLogin();
  const apiUrl = isAdminPage()
    ? `${BASE_URL}/missions/submissions/all/mcqs/` // 관리자용 API
    : `${BASE_URL}/missions/submissions/user/mcqs/`; // 일반 사용자용 API

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // JWT 토큰을 Authorization 헤더에 추가
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      populateMCQTable(data); // 객관식 문제 테이블 채우기
    } else {
      console.error("Failed to fetch MCQ submissions:", data);
      alert("Failed to load submissions. Please try again.");
    }
  } catch (error) {
    console.error('Error fetching the MCQ submissions:', error);
    alert("Error occurred while fetching MCQ submissions.");
  }
}

// 객관식 문제 데이터를 동적으로 테이블에 채우는 함수
function populateMCQTable(submissions) {
  const mcqTable = document.querySelector('#mcq-table ul'); // id로 선택 (객관식 문제)

  // mcqTable이 존재하는지 확인
  if (!mcqTable) {
    console.error("MCQ table element not found");
    return;
  }

  mcqTable.innerHTML = `
    <li class="tpd-table-head">
      <div class="tpd-table-row">
        <div class="tpd-quiz-info-sub">
          <h4 class="tpd-table-title">Quiz Info</h4>
        </div>
        <div class="tpd-quiz-ques">
          <h4 class="tpd-table-title">Select</h4>
        </div>
        <div class="tpd-quiz-result-sub">
          <h4 class="tpd-table-title">Result</h4>
        </div>
      </div>
    </li>
  `;

  // 각 제출 데이터를 반복하여 테이블에 추가
  submissions.forEach(data => {
    const isCorrectClass = data.is_correct ? 'sucess' : 'danger';
    const isCorrectText = data.is_correct ? 'Pass' : 'Fail';

    // 새로운 HTML 행을 추가
    const newRow = `
      <li>
        <div class="tpd-table-row">
          <div class="tpd-quiz-info-sub">
            <span class="tpd-common-date">${new Date(data.submitted_at).toLocaleString()}</span>
            <h4 class="tpd-quiz-title">${data.question}</h4>
            <div class="tpd-student-info">
              <p><span>Student: </span> ${data.user}</p>
            </div>
          </div>
          <div class="tpd-quiz-ques">
            <span class="tpd-common-text">${data.selected_option}</span>
          </div>
          <div class="tpd-quiz-result-sub">
            <div class="tpd-badge-item">
              <span class="tpd-badge ${isCorrectClass}">${isCorrectText}</span>
            </div>
          </div>
        </div>
      </li>
    `;

    // 테이블에 새로운 행을 추가
    mcqTable.innerHTML += newRow;
  });
}

// API 요청을 보내 코드 제출형 문제 데이터를 가져오는 함수
async function fetchCodeSubmissions() {
  const accessToken = checkLogin();
  const apiUrl = isAdminPage()
    ? `${BASE_URL}/missions/submissions/all/cs/` // 관리자용 API
    : `${BASE_URL}/missions/submissions/user/cs/`; // 일반 사용자용 API

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // JWT 토큰을 Authorization 헤더에 추가
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      populateCodeSubmissionTable(data); // 코드 제출형 문제 테이블 채우기
    } else {
      console.error("Failed to fetch code submissions:", data);
      alert("Failed to load code submissions. Please try again.");
    }
  } catch (error) {
    console.error('Error fetching the code submissions:', error);
    alert("Error occurred while fetching code submissions.");
  }
}

// 코드 제출형 문제 데이터를 동적으로 테이블에 채우는 함수
function populateCodeSubmissionTable(submissions) {
  const codeTable = document.querySelector('#code-table ul');  // id로 선택 (코드 제출형 문제)

  // codeTable이 존재하는지 확인
  if (!codeTable) {
    console.error("Code submission table element not found");
    return;
  }

  codeTable.innerHTML = `
    <li class="tpd-table-head">
      <div class="tpd-table-row">
        <div class="tpd-quiz-info-sub">
          <h4 class="tpd-table-title">Quiz Info</h4>
        </div>
        <div class="tpd-quiz-result-sub">
          <h4 class="tpd-table-title">Result</h4>
        </div>
      </div>
    </li>
  `;

  // 각 제출 데이터를 반복하여 테이블에 추가
  submissions.forEach(data => {
    const isPassedClass = data.is_passed ? 'sucess' : 'danger';
    const isPassedText = data.is_passed ? 'Pass' : 'Fail';

    // 새로운 HTML 행을 추가
    const newRow = `
      <li>
        <div class="tpd-table-row">
          <div class="tpd-quiz-info-sub">
            <span class="tpd-common-date">${new Date(data.submission_time).toLocaleString()}</span>
            <h4 class="tpd-quiz-title">${data.code_submission}</h4>
            <div class="tpd-student-info">
              <p><span>Student: </span> ${data.user}</p>
            </div>
          </div>
          <div class="tpd-quiz-result-sub">
            <div class="tpd-badge-item">
              <span class="tpd-badge ${isPassedClass}">${isPassedText}</span>
            </div>
          </div>
        </div>
      </li>
    `;

    // 테이블에 새로운 행을 추가
    codeTable.innerHTML += newRow;
  });
}

// 페이지 로드 시 객관식 및 코드 제출형 문제 데이터를 가져와서 테이블을 채움
window.onload = function() {
  fetchMCQSubmissions(); // 객관식 문제 데이터를 가져옴
  fetchCodeSubmissions(); // 코드 제출형 문제 데이터를 가져옴
};
