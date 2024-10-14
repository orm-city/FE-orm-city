import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';


const accessToken = getAccessToken();
async function fetchPaymentInfo() {
    
    if (!accessToken) {
        console.error("Access Token not found");
        throw new Error('Authentication required');
    }

    try {
        const response = await fetch(`${BASE_URL}/payment/user-payments/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching payment info:', error);
        throw error;
    }
}

function displayCourses(paymentInfo) {
    const coursesContainer = document.getElementById('courses-container');
    coursesContainer.innerHTML = '';  // 기존 내용을 지우고 새로 추가

    paymentInfo.forEach(course => {
        const courseItem = `
            <div class="col-xl-4 col-md-6">
                <div class="tp-dashboard-course tp-dashboard-course-2 mb-25">
                    <div class="tp-dashboard-course-thumb">
                        <a href="course-details-2.html"><img src="/assets/img/dashboard/course/course-thumb-1.jpg" alt=""></a>
                    </div>
                    <div class="tp-dashboard-course-content">
                        <h4 class="tp-dashboard-course-title"><a href="course-details-2.html">${course.major_category}</a></h4>
                        <div class="tp-dashboard-course-meta">
                            <span>
                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.9228 10.0426V2.29411C13.9228 1.51825 13.2949 0.953997 12.5252 1.01445H12.4847C11.1276 1.12529 9.07163 1.82055 7.91706 2.53596L7.80567 2.6065C7.62337 2.71733 7.30935 2.71733 7.11692 2.6065L6.9549 2.50573C5.81046 1.79033 3.75452 1.1152 2.3974 1.00437C1.62768 0.943911 0.999756 1.51827 0.999756 2.28405V10.0426C0.999756 10.6573 1.50613 11.2417 2.12393 11.3122L2.30622 11.3425C3.70386 11.5238 5.87126 12.2392 7.10685 12.9143L7.1372 12.9244C7.30937 13.0252 7.59293 13.0252 7.75498 12.9244C8.99057 12.2393 11.1681 11.5339 12.5758 11.3425L12.7885 11.3122C13.4164 11.2417 13.9228 10.6674 13.9228 10.0426Z" stroke="#94928E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M7.46118 2.81787V12.4506" stroke="#94928E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                                12 Lessons
                            </span>
                        </div>
                        <div class="tp-dashboard-btn d-flex align-items-center justify-content-between">
                            <div class="tp-course-pricing text-start">
                                <span>${course.price}</span>
                            </div>
                            <div class="tp-course-action d-flex align-items-center">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        coursesContainer.innerHTML += courseItem;
    });
}

async function init() {
    try {
        const paymentInfo = await fetchPaymentInfo();
        displayCourses(paymentInfo);
    } catch (error) {
        console.error('Failed to initialize:', error);
        // 여기에 에러 처리 로직을 추가하세요 (예: 사용자에게 에러 메시지 표시)
    }
}

// 페이지 로드 시 초기화 함수 실행
window.addEventListener('load', init);

  // 페이지 로드 시 데이터 로드
document.addEventListener('DOMContentLoaded', fetchMajorCategories);
