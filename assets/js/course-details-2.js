import { BASE_URL } from './config.js';

// API에서 Minor Category와 그에 속한 Video를 가져오는 함수
async function fetchMinorCategories(majorCategoryId, accessToken) {
   try {
      const response = await fetch(`${BASE_URL}/courses/minor-categories/by-major/${majorCategoryId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,  // Authorization 헤더에 accessToken 추가
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch minor categories');
      }

      const data = await response.json();
      renderMinorCategories(data);
  } catch (error) {
      handleError(error, 'Error fetching the minor categories and videos');
  }
}

// Minor Categories와 그에 속한 Videos를 HTML에 렌더링하는 함수
function renderMinorCategories(minorCategories) {
    

    const minorCategoryContainer = document.getElementById('minor-category-container');
    minorCategoryContainer.innerHTML = ''; // 기존 내용을 초기화

    minorCategories.forEach((minorCategory, index) => {
        const videosHtml = minorCategory.videos.map(video => createVideoHtml(video)).join('');
        const minorCategoryHtml = createMinorCategoryHtml(minorCategory, index, videosHtml);
        minorCategoryContainer.innerHTML += minorCategoryHtml;
    });
}

// 개별 비디오의 HTML을 생성하는 함수
function createVideoHtml(video) {
    return `
        <div class="tp-course-details-2-faq-item d-flex justify-content-between">
            <div class="left">
                <span><i>${video.name}:</i> ${video.description}</span>
            </div>
        </div>`;
}

// Minor Category의 HTML을 생성하는 함수
function createMinorCategoryHtml(minorCategory, index, videosHtml) {
    return `
        <div class="accordion-item">
            <h2 class="accordion-header" id="panelsStayOpen-heading-${index}">
                <button class="accordion-button d-flex justify-content-between" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapse-${index}" aria-expanded="false" aria-controls="panelsStayOpen-collapse-${index}">
                    <span>${minorCategory.name}</span>
                    <span class="accordion-btn"></span>
                </button>
            </h2>
            <div id="panelsStayOpen-collapse-${index}" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-heading-${index}">
                <div class="accordion-body">
                    ${videosHtml}
                </div>
            </div>
        </div>`;
}

// API를 통해 비디오의 총 개수를 가져오는 함수
async function fetchTotalVideoCount(majorCategoryId) {
    try {
        const response = await fetch(`${BASE_URL}/courses/major-categories/${majorCategoryId}/details/`);
        const data = await response.json();
        updateTotalVideoCount(data.total_video_count);
    } catch (error) {
        handleError(error, 'Error fetching total video count');
    }
}

// 총 비디오 개수를 HTML에 업데이트하는 함수
function updateTotalVideoCount(totalVideoCount) {
    const totalVideoCountElement = document.getElementById('total-videos-count');
    totalVideoCountElement.textContent = totalVideoCount;
}

// 페이지 로드 시 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    const accessToken = getCookie('access');
    if (!accessToken) {
        handleNotLoggedIn();
        return;
    }

    const majorCategoryId = extractMajorCategoryIdFromUrl();
    if (majorCategoryId) {
        fetchMinorCategories(majorCategoryId, accessToken);
        fetchTotalVideoCount(majorCategoryId);
    } else {
        console.error('URL에서 major_category_id를 찾을 수 없습니다.');
    }
});

// URL에서 major_category_id 추출하는 함수
function extractMajorCategoryIdFromUrl() {
    const path = window.location.pathname;
    const regex = /\/major\/(\d+)(\/|$)/;
    const match = path.match(regex);
    return match ? match[1] : null;
}

// 쿠키에서 특정 이름의 값을 추출하는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

// 로그인이 안 되어 있을 때 처리하는 함수
function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

// 에러 발생 시 처리하는 함수
function handleError(error, message) {
    console.error(`${message}:`, error);
   //  window.location.href = '/404'; // 에러 발생 시 404 페이지로 리디렉션
}
