document.addEventListener('DOMContentLoaded', function() {
    // URL에서 major ID 추출
    const pathSegments = window.location.pathname.split('/');
    const majorId = pathSegments[pathSegments.length - 1];

    // Django 백엔드에서 major 세부 정보 가져오기
    fetch(`http://127.0.0.1:8000/courses/major-categories/${majorId}/`)
        .then(response => response.json())
        .then(major_categories => {
            // 가져온 데이터로 페이지 내용 업데이트
            const majorCourseDetailsCardElement = document.getElementById('course-details-card');
            const majorCourseTitleElement = document.getElementById('majorCourseTitle');
            majorCourseDetailsCardElement.innerHTML = `
                    <div class="tp-course-details-2-widget-content">
                        <div class="tp-course-details-2-widget-price">
                            <span>${major_categories.price}</span>
                        </div>
                        <div class="tp-course-details-2-widget-btn">
                            <a href="course-with-filter.html">강의 구매하기</a>
                        </div>

                        <div class="tp-course-details-2-widget-list">
                            <h5>This course includes:</h5>
                    
                            <div class="tp-course-details-2-widget-list-item-wrapper">
                    
                                <div class="tp-course-details-2-widget-list-item d-flex align-items-center justify-content-between">
                                <span> <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 1C12.6415 1 16 4.35775 16 8.5C16 12.6423 12.6415 16 8.5 16C4.35775 16 1 12.6423 1 8.5C1 4.35775 4.35775 1 8.5 1Z" stroke="#4F5158" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.8692 8.49618C10.8692 7.85581 7.58703 5.80721 7.2147 6.17556C6.84237 6.54391 6.80657 10.4137 7.2147 10.8168C7.62283 11.2213 10.8692 9.13655 10.8692 8.49618Z" stroke="#4F5158" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg> Lectures</span>
                                <span id="total-videos-count">{비디오의 총 개수}</span>
                                </div>
                                <div class="tp-course-details-2-widget-list-item d-flex align-items-center justify-content-between">
                                <span> <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z" stroke="#4F5158" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M8 3.80005V8.00005L10.8 9.40005" stroke="#4F5158" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg> Duration</span>
                                <span>4h 50m</span>
                                </div>
                        </div>
                    </div>

            `;
            
            majorCourseTitleElement.innerHTML = `<h3 class="tp-course-details-2-title">${major_categories.name}</h3>`
        })
        .catch(error => {
            console.error('Error fetching major details:', error);
            document.getElementById('course-details-card').innerHTML = '<p>정보를 불러오는 데 실패했습니다.</p>';
        });
});