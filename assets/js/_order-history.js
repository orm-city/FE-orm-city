// import { baseurl } from './config.js';

console.log('All cookies:', document.cookie);

document.addEventListener('DOMContentLoaded', function() {
    function getAccessToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            console.log('Checking cookie:', name, value);
            if (name === 'access') {
                console.log('Access token found:', value);
                return decodeURIComponent(value);
            }
        }
        console.log('Access token not found in cookies');
        return null;
    }

    const BASE_URL = 'http://localhost:8000';
    // 결제 정보를 가져오는 함수
    async function fetchPaymentInfo() {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error('Access token not found');
            return;
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

            const data = await response.json();
            return data;  // 여러 결제 정보 배열 반환
        } catch (error) {
            console.error('Error fetching payment info:', error);
        }
    }

    // HTML 엘리먼트 업데이트 함수
    function updatePaymentInfo(paymentInfoList) {

        if (!paymentInfoList || paymentInfoList.length === 0) {
            console.log('No payment information available');
            // 결제 정보가 없을 때의 UI 처리
            const container = document.getElementById('orderInfoElement').parentElement;
            container.innerHTML = '<p>결제 정보가 없습니다.</p>';
            return;
        }
    
        const container = document.getElementById('orderInfoElement').parentElement;
        const getRefundableStatus = (isRefundable) => isRefundable ? '가능' : '불가능';

        paymentInfoList.forEach((paymentInfo, index) => {
            const orderInfoElement = document.createElement('div');
            orderInfoElement.className = 'tpd-table-row';
            orderInfoElement.id = `orderInfoElement_${index}`;

            const formatDate = (dateString) => {
                const date = new Date(dateString);
                const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더합니다
                const day = date.getDate();
                return `${month}월 ${day}일`;
            };

        const formattedDate = formatDate(paymentInfo.date);
        const refundButtons = document.querySelectorAll('.refund-button');

        
        container.innerHTML = ''; // 기존 내용 초기화

            orderInfoElement.innerHTML = `
                <div class="tpd-order-id">
                    <h4 class="tpd-common-text">#${paymentInfo.id}</h4>
                </div>
                <div class="tpd-order-name">
                    <h4 class="tpd-common-text">${paymentInfo.major_category}</h4>
                </div>
                <div class="tpd-order-date">
                    <h4 class="tpd-common-text">${formattedDate}</h4>
                </div>
                <div class="tpd-order-price">
                    <h4 class="tpd-common-text">₩${paymentInfo.amount}</h4>
                </div>
                <div class="tpd-order-status">
                    <div class="tpd-badge-item">
                        <span class="tpd-badge ${getStatusClass(paymentInfo.status)}">${getStatusText(paymentInfo.status)}</span>
                    </div>
                </div>
                <div class="tpd-order-refundable">
                ${paymentInfo.is_refundable 
                    ? `<button class="refund-button" data-payment-id="${paymentInfo.id}">환불 신청</button>`
                    : '<h4 class="tpd-common-text">환불 불가능</h4>'}
            </div>
            `;
            container.appendChild(orderInfoElement);

            if (paymentInfo.is_refundable) {
                const refundButton = orderInfoElement.querySelector('.refund-button');
                refundButton.addEventListener('click', function() {
                    const paymentId = this.getAttribute('data-payment-id');
                    handleRefund(paymentId);
                });
            }
        });
    }

    
    // 상태에 따른 클래스 반환 함수
    function getStatusClass(status) {
        switch(status) {
            case 'ready': return 'warning';
            case 'paid': return 'success';
            case 'cancelled': case 'failed': return 'danger';
            default: return '';
        }
    }

    // 상태에 따른 텍스트 반환 함수
    function getStatusText(status) {
        switch(status) {
            case 'ready': return '미결제';
            case 'paid': return '결제완료';
            case 'cancelled': return '결제취소';
            case 'failed': return '결제실패';
            default: return '알 수 없음';
        }
    }

    async function handleRefund(paymentId) {
        const token = getAccessToken();
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        const isConfirmed = confirm("정말로 환불을 진행하시겠습니까?");
        if (!isConfirmed) return;

        const defaultReason = "고객 요청";

        try {
            const paymentResponse = await fetch(`${BASE_URL}/payment/detail/${paymentId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!paymentResponse.ok) {
                throw new Error('결제 정보를 가져오는데 실패했습니다.');
            }

            const paymentData = await paymentResponse.json();

            const response = await fetch(`${BASE_URL}/payment/refund/${paymentId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    merchant_uid: paymentData.merchant_uid,
                    reason: defaultReason,
                    cancel_request_amount: paymentData.amount
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '환불이 성공적으로 처리되었습니다.');
                loadPaymentInfo(); // 결제 목록 새로고침
            } else {
                const errorMessage = result.error || '환불 처리 중 오류가 발생했습니다.';
                console.error('환불 처리 실패:', errorMessage);
                alert(`환불 처리 실패: ${errorMessage}`);
            }
        } catch (error) {
            console.error('환불 처리 중 예외 발생:', error);
            alert(`환불 처리 중 오류가 발생했습니다: ${error.message}`);
        }
    }


    // 메인 실행 함수
    async function loadPaymentInfo() {
        const paymentInfoList = await fetchPaymentInfo();
        if (paymentInfoList && paymentInfoList.length > 0) {
            updatePaymentInfo(paymentInfoList);
        } else {
            console.log('No payment information available');
            // 결제 정보가 없을 때의 UI 처리
        }
    }

    // 결제 정보 로드 실행
    loadPaymentInfo();
});

