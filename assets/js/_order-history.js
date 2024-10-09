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
    // 결제 정보를 가져오는 함수
    async function fetchPaymentInfo() {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error('Access token not found');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/payment/user-payments/', {
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
        const container = document.getElementById('orderInfoElement').parentElement;
        container.innerHTML = ''; // 기존 내용 초기화

        paymentInfoList.forEach((paymentInfo, index) => {
            const orderInfoElement = document.createElement('div');
            orderInfoElement.className = 'tpd-table-row';
            orderInfoElement.id = `orderInfoElement_${index}`;
            orderInfoElement.innerHTML = `
                <div class="tpd-order-id">
                    <h4 class="tpd-common-text">#${paymentInfo.id}</h4>
                </div>
                <div class="tpd-order-name">
                    <h4 class="tpd-common-text">${paymentInfo.major_category}</h4>
                </div>
                <div class="tpd-order-date">
                    <h4 class="tpd-common-text">${paymentInfo.date}</h4>
                </div>
                <div class="tpd-order-price">
                    <h4 class="tpd-common-text">₩${paymentInfo.amount}</h4>
                </div>
                <div class="tpd-order-status">
                    <div class="tpd-badge-item">
                        <span class="tpd-badge ${getStatusClass(paymentInfo.status)}">${getStatusText(paymentInfo.status)}</span>
                    </div>
                </div>
                <div class="tpd-order-action">
                    <div class="tpd-action-btn">
                        <a href="${paymentInfo.receipt_url || '#'}" target="_blank" download>
                            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 8.23975V10.7466C13 11.079 12.8595 11.3979 12.6095 11.6329C12.3594 11.868 12.0203 12.0001 11.6667 12.0001H2.33333C1.97971 12.0001 1.64057 11.868 1.39052 11.6329C1.14048 11.3979 1 11.079 1 10.7466V8.23975" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M10.3327 5.38704L6.99935 8.52063L3.66602 5.38704" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M7 1V8.52061" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                            <span class="tpd-action-tooltip">Download</span>
                        </a>
                    </div>
                </div>
            `;
            container.appendChild(orderInfoElement);
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

