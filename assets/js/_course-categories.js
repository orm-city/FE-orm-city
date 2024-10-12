import { BASE_URL } from "./config.js";
          // API에서 데이터 가져오기
document.addEventListener('DOMContentLoaded', function() {
  // API에서 데이터 가져오기
  fetch(`${BASE_URL}/courses/major-categories/`)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('categoryContainer');
      
      data.forEach(category => {
        const categoryHTML = `
          <div class="col-lg-3 col-sm-6">
            <a href="course-with-filter.html" class="tp-course-categories-item p-relative mb-25 wow fadeInUp" data-wow-delay=".3s">
              <div class="tp-course-categories-icon">
                <span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- SVG 경로 데이터 -->
                  </svg>
                </span>
              </div>
              <h3 class="tp-course-categories-title">${category.name}</h3>
              <p>${category.course_count} Courses</p>
            </a>
          </div>
        `;
        
        container.innerHTML += categoryHTML;
      });
    })
    .catch(error => console.error('Error:', error));
});