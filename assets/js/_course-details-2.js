import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';


    // URL에서 major ID 추출
    const pathSegments = window.location.pathname.split('/');
    const majorId = pathSegments[pathSegments.length - 1];

    const accessToken = getAccessToken();
    if (!accessToken) {
        console.error("Access Token not found");
        throw new Error('Authentication required');
    }
    console.log("Access Token>>", accessToken);

    // 메인 함수
    async function loadCourseDetails() {
        try {
            const response = await fetch(`${BASE_URL}/courses/major-categories/${majorId}/`,{ // 기본 GET요청
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
            setupPaymentButton(majorId);
        } catch (error) {
            console.error('Error loading course details:', error);
            document.getElementById('course-details-card').innerHTML = '<p>정보를 불러오는 데 실패했습니다.</p>';
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
                 </div>fetchAndRenderMinorCategories

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

    function setupPaymentButton(majorId) {
        document.getElementById('paymentButton').addEventListener('click', async function() {
            const accessToken = getAccessToken();
            if (!accessToken) {
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
            }
    
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
                console.error('Failed to get payment information:', error);
                if (error.message.includes('401')) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                } else {
                    alert('Failed to get payment information');
                }
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
            console.error('Payment verification failed:', error);
            if (error.message.includes('401')) {
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login/';
            } else {
                alert('Payment verification failed');
            }
            throw error;
        }
    }

document.addEventListener('DOMContentLoaded', loadCourseDetails);