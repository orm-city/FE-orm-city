import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();

async function loadCourseDetails() {
    try {
       
        if (!accessToken) {
            handleNotLoggedIn();
            return;
        }

        const majorId = extractMajorCategoryIdFromUrl();
        if (!majorId) {
            console.error('URL에서 major_category_id를 찾을 수 없습니다.');
            return;
        }

        const response = await fetch(`${BASE_URL}/courses/major-categories/${majorId}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const major_categories = await response.json();

        // DOM 요소 업데이트
        updateDOM(major_categories);

        // 결제 버튼 이벤트 리스너 설정
        setupPaymentButton(majorId, accessToken);

        // API에서 Minor Category와 그에 속한 Video를 가져오는 함수
        await fetchMinorCategories(majorId, accessToken);

        // 총 비디오 개수 로드
        await fetchTotalVideoCount(majorId);

    } catch (error) {
        handleError(error, 'Error loading course details'); // 에러 발생 시 처리
    }
}

function updateDOM(major_categories) {
    const majorCourseDetailsCardElement = document.getElementById('course-details-card');
    const majorCourseTitleElement = document.getElementById('majorCourseTitle');

    majorCourseDetailsCardElement.innerHTML = `
        <div class="tp-course-details-2-widget-content">
             <div class="tp-course-details-2-widget-price">
                     <span>${major_categories.price}</span>
                 </div>
                 <div class="tp-course-details-2-widget-btn">
                     <a href="#" id="paymentButton">강의 구매하기</a>
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

    majorCourseTitleElement.innerHTML = `<h3 class="tp-course-details-2-title">${major_categories.name}</h3>`;
}

function setupPaymentButton(majorId, accessToken) {
    document.getElementById('paymentButton').addEventListener('click', async function() {
        try {
            const response = await fetch(`${BASE_URL}/payment/info/${majorId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const paymentInfo = await response.json();

            console.log('결제정보>>>>', paymentInfo);
            await processPayment(paymentInfo, accessToken);
        } catch (error) {
            handleError(error, 'Failed to get payment information');
        }
    });
}

async function processPayment(paymentInfo, accessToken) {
    var IMP = window.IMP;
    IMP.init(paymentInfo.imp_key);

    return new Promise((resolve, reject) => {
        IMP.request_pay({
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: 'merchant_' + new Date().getTime(),
            name: paymentInfo.major_category_name,
            amount: paymentInfo.major_category_price,
        }, async function(rsp) {
            console.log('아임포트 결제 응답>>>>', rsp);
            if (rsp.success) {
                try {
                    await verifyPayment(rsp, paymentInfo, accessToken);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            } else {
                console.error('Payment failed:', rsp);
                alert('Payment failed: ' + rsp.error_msg);
                reject(new Error('Payment failed'));
            }
        });
    });
}

async function verifyPayment(rsp, paymentInfo, accessToken) {
    const dataToSend = {
        imp_uid: rsp.imp_uid,
        merchant_uid: rsp.merchant_uid,
        major_category_id: paymentInfo.major_category_id,
        total_amount: Math.round(rsp.paid_amount),
        payment_status: rsp.status,
        user_id: paymentInfo.user_id,
    };
    console.log('Data to send:', dataToSend);

    try {
        const response = await fetch(`${BASE_URL}/payment/complete/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        console.log('Payment verification successful:', result);
        alert('Payment completed successfully');
    } catch (error) {
        handleError(error, 'Payment verification failed');
    }
}

async function fetchMinorCategories(majorCategoryId, accessToken) {
    try {
        const response = await fetch(`${BASE_URL}/courses/minor-categories/by-major/${majorCategoryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
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
        const response = await fetch(`${BASE_URL}/courses/major-categories/${majorCategoryId}/details/`,{
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
                'Content-Type': 'application/json'
            }
        });
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

// URL에서 major_category_id 추출하는 함수
function extractMajorCategoryIdFromUrl() {
    const path = window.location.pathname;
    const regex = /\/major\/(\d+)(\/|$)/;
    const match = path.match(regex);
    return match ? match[1] : null;
}

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

function handleError(error, message) {
    console.error(`${message}:`, error);
    if (error.message.includes('401')) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login/';
    } else {
        document.getElementById('course-details-card').innerHTML = '<p>정보를 불러오는 데 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadCourseDetails); // 페이지 로드 시 데이터 로드
