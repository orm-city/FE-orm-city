document.addEventListener('DOMContentLoaded', () => {
    // 여기서 fetchUserPayments 함수를 호출하거나 다른 초기화 코드를 추가
    fetchUserPayments();
});

// 쿠키에서 토큰을 가져오는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 결제 정보를 가져오는 비동기 함수
async function fetchUserPayments() {
    const token = getCookie('token'); // 쿠키에서 토큰 가져오기
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8000/payment/user-payments/', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('결제 정보를 가져오는데 실패했습니다.');
        }

        const payments = await response.json();
        displayPayments(payments); // 결제 정보를 표시하는 함수 호출
    } catch (error) {
        console.error('결제 정보를 가져오는데 실패했습니다:', error);
        alert('결제 정보를 가져오는데 실패했습니다.');
    }
}

// 결제 정보를 HTML 구조에 맞게 표시하는 함수
function displayPayments(payments) {
    const courseArea = document.querySelector('.course-area .row');

    // 기존 코스 정보를 지우고 새로 추가
    courseArea.innerHTML = '';

    payments.forEach(payment => {
        const courseHTML = `
            <div class="col-xl-4 col-md-6">
                <div class="tp-dashboard-course tp-dashboard-course-2 mb-25">
                    <div class="tp-dashboard-course-thumb">
                        <a href="course-details-2.html"><img src="${payment.course_image}" alt=""></a>
                    </div>
                    <div class="tp-dashboard-course-content">
                        <h4 class="tp-dashboard-course-title"><a href="course-details-2.html">${payment.course_name}</a></h4>
                        <div class="tp-dashboard-course-meta">
                            <span>${payment.total_study_time}</span>
                        </div>
                        <div class="tp-dashboard-btn d-flex align-items-center justify-content-between">
                            <div class="tp-course-pricing text-start">
                                <span>${payment.price}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        courseArea.insertAdjacentHTML('beforeend', courseHTML);
    });
}
