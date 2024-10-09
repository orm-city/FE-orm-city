import { baseurl } from './config.js';

// API에서 데이터를 받아와 코스 항목을 생성하는 함수
async function fetchMajorCategories() {
    try {
      const response = await fetch(`${baseurl}/courses/major-categories/`);
      const data = await response.json();

      // 받은 데이터를 기반으로 코스 항목 생성
      const coursesContainer = document.getElementById('courses-container');
      coursesContainer.innerHTML = '';  // 기존 내용을 지우고 새로 추가

      data.forEach(course => {
        // course.major_id를 이용해 동적으로 라우팅 경로를 설정
        const courseItem = `
          <div class="col-lg-4 col-md-6">
            <div class="tp-course-item p-relative fix mb-30">
                
                <div class="tp-course-thumb">
                  <a href="/major/${course.id}"><img class="course-pink" src="/assets/img/course/course-thumb-1.jpg" alt=""></a>
                </div>
                <div class="tp-course-content">
                  <div class="tp-course-tag mb-10">
                  </div>
                  <div class="tp-course-meta">
                  </div>
                  <h4 class="tp-course-title">
                      <a href="/major/${course.id}">${course.name}</a>
                  </h4>
                  <div class="tp-course-rating d-flex align-items-end justify-content-between">
                      <div class="tp-course-pricing home-2">
                        <span>${course.price}원</span>
                      </div>
                  </div>
                </div>
                <div class="tp-course-btn home-2">
                  <a href="/major/${course.id}">Preview this Course</a>
                </div>
            </div>
          </div>`;
          
        coursesContainer.innerHTML += courseItem;
      });
    } catch (error) {
      console.error('Error fetching the courses:', error);
    }
  }

  // 페이지 로드 시 데이터 로드
  document.addEventListener('DOMContentLoaded', fetchMajorCategories);
