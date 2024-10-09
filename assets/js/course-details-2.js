import { baseurl } from './config.js';

// API에서 Minor Category와 그에 속한 Video를 가져와 동적으로 HTML에 추가하는 함수
async function fetchMinorCategories(majorCategoryId) {
    try {
       // API 요청
       const response = await fetch(`${baseurl}/courses/minor-categories/by-major/${majorCategoryId}`);
       const data = await response.json();

       // 응답에서 minor_categories 배열을 가져옴
       const minorCategories = data.minor_categories;

       // minor_categories가 빈 배열([])이면 404 페이지로 리디렉션
       if (Array.isArray(minorCategories) && minorCategories.length === 0) {
          // 404 페이지로 리디렉션
          window.location.href = '/404';  // 404 페이지 경로로 리디렉션
          return;
       }

       // minor_categories가 배열일 경우만 처리
       if (Array.isArray(minorCategories)) {
          const minorCategoryContainer = document.getElementById('minor-category-container');
          minorCategoryContainer.innerHTML = '';  // 기존 내용을 초기화

          minorCategories.forEach((minorCategory, index) => {
                const videosHtml = minorCategory.videos.map(video => {
                   return `
                   <div class="tp-course-details-2-faq-item d-flex justify-content-between">
                      <div class="left">
                            <span><i>${video.name}:</i> ${video.description}</span>
                      </div>
                   </div>`;
                }).join('');

                const minorCategoryHtml = `
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

                minorCategoryContainer.innerHTML += minorCategoryHtml;
          });
       } else {
          console.error('응답 데이터에 minor_categories 배열이 없습니다.');
       }
    } catch (error) {
       console.error('Error fetching the minor categories and videos:', error);
       // 에러 발생 시 404 페이지로 리디렉션할 수 있음
       window.location.href = '/404';
    }
 }


 // API를 통해 비디오의 총 개수를 가져와 HTML에 삽입하는 함수
 async function fetchTotalVideoCount(majorCategoryId) {
    try {
       // API 요청
       const response = await fetch(`${baseurl}/courses/minor-categories/by-major/${majorCategoryId}`);
       const data = await response.json();

       // 총 비디오 개수 가져오기
       const totalVideoCount = data.total_video_count;

       // HTML 요소에 총 비디오 개수 삽입
       const totalVideoCountElement = document.getElementById('total-videos-count');
       totalVideoCountElement.textContent = totalVideoCount;
    } catch (error) {
       console.error('Error fetching total video count:', error);
    }
 }

 // 페이지 로드 시 특정 major_category_id로 데이터 로드
 document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지의 URL 경로 가져오기
    const path = window.location.pathname;

    // "/major/<int:id>/"에서 id 추출
    const regex = /\/major\/(\d+)(\/|$)/;
    const match = path.match(regex);

    // 매치가 성공하면, 첫 번째 캡처 그룹(숫자) 가져오기
    if (match) {
       const majorCategoryId = match[1];  // '<int:id>'에 해당하는 숫자를 가져옴
       // 가져온 major_category_id를 사용하여 데이터 로드
       fetchMinorCategories(majorCategoryId);
       fetchTotalVideoCount(majorCategoryId);
    } else {
       console.error('URL에서 major_category_id를 찾을 수 없습니다.');
    }
 });