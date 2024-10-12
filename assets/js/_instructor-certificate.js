import { BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
  const accessToken = getCookie('access');
  if (!accessToken) {
    handleNotLoggedIn();
    return;
  }
  const majorCertificatesContainer = document.querySelectorAll(".tpd-course-area ul")[0];
  const minorCertificatesContainer = document.querySelectorAll(".tpd-course-area ul")[1];

  // 기존 HTML 내용 초기화
  majorCertificatesContainer.innerHTML = "";
  minorCertificatesContainer.innerHTML = "";

  // API로부터 데이터를 가져오는 함수
  async function fetchCertificates() {
    try {
      const response = await fetch(`${BASE_URL}/certificates/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      renderCertificates(data);
    } catch (error) {
      console.error("API 요청에 실패했습니다.", error);
    }
  }

  // 인증서를 HTML에 렌더링하는 함수
  function renderCertificates(data) {
    const { available_major_certificates, available_minor_certificates } = data;
    
    available_major_certificates.forEach((certificate) => {
      const listItem = createCertificateListItem(certificate, 'major');
      majorCertificatesContainer.appendChild(listItem);
    });
    
    available_minor_certificates.forEach((certificate) => {
      const listItem = createCertificateListItem(certificate, 'minor');
      minorCertificatesContainer.appendChild(listItem);
    });

    // 미리보기와 다운로드 이벤트 리스너 등록
    document.querySelectorAll('.tpd-certificate-badge.preview').forEach(button => {
      button.addEventListener('click', function () {
        const courseType = this.dataset.courseType;
        const courseId = this.dataset.courseId;
        handlePreview(courseType, courseId);
      });
    });

    document.querySelectorAll('.tpd-certificate-badge.download').forEach(button => {
      button.addEventListener('click', function () {
        const courseType = this.dataset.courseType;
        const courseId = this.dataset.courseId;
        handleDownload(courseType, courseId);
      });
    });
  }

  // 쿠키에서 accessToken 추출 함수
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // 로그인이 안 되어 있을 때 처리하는 함수
  function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }

  // 인증서 리스트 아이템을 생성하는 함수
  function createCertificateListItem(certificate, courseType) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="tpd-table-row">
        <div class="tpd-certificate-box d-flex justify-content-between align-items-center">
          <div class="tpd-certificate-info d-flex align-items-center">
            <h4 class="tpd-certificate-title">${certificate.name}</h4>
          </div>
          <div class="tpd-cartificate-btn-box d-flex">
            <div class="tpd-certificate-badges">
              <button class="tpd-certificate-badge preview" data-course-type="${courseType}" data-course-id="${certificate.id}">
                <span class="tpd-certificate-badge-text">
                  <span class="tpd-certificate-badge-file">
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 6.2C1 3.7487 1 2.52304 1.80912 1.76152C2.61823 1 3.92049 1 6.525 1H7.02727C9.14706 1 10.2069 1 10.943 1.51859C11.1539 1.66718 11.3411 1.84339 11.499 2.04188C12.05 2.73464 12.05 3.73218 12.05 5.72727V7.38182C12.05 9.30788 12.05 10.2709 11.7452 11.0401C11.2552 12.2766 10.2189 13.2519 8.90507 13.7131C8.08784 14 7.06462 14 5.01818 14C3.84879 14 3.26409 14 2.7971 13.8361C2.04636 13.5725 1.45419 13.0152 1.17418 12.3086C1 11.8691 1 11.3188 1 10.2182V6.2Z" stroke="currentColor" stroke-linejoin="round"/>
                      <path d="M12.0469 7.5C12.0469 8.69662 11.0768 9.66667 9.88021 9.66667C9.44745 9.66667 8.93725 9.59084 8.51649 9.70358C8.14264 9.80375 7.85063 10.0958 7.75046 10.4696C7.63771 10.8904 7.71354 11.4006 7.71354 11.8333C7.71354 13.03 6.74349 14 5.54688 14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.92188 4.25049H8.47187" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.92188 6.84937H5.87187" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  미리보기
                </span>
              </button>
            </div>
            <div class="tpd-certificate-delete">
              <button class="tpd-certificate-badge download" data-course-type="${courseType}" data-course-id="${certificate.id}">
                <span class="tpd-certificate-badge-text">
                  <span class="tpd-certificate-badge-file">
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 6.2C1 3.7487 1 2.52304 1.80912 1.76152C2.61823 1 3.92049 1 6.525 1H7.02727C9.14706 1 10.2069 1 10.943 1.51859C11.1539 1.66718 11.3411 1.84339 11.499 2.04188C12.05 2.73464 12.05 3.73218 12.05 5.72727V7.38182C12.05 9.30788 12.05 10.2709 11.7452 11.0401C11.2552 12.2766 10.2189 13.2519 8.90507 13.7131C8.08784 14 7.06462 14 5.01818 14C3.84879 14 3.26409 14 2.7971 13.8361C2.04636 13.5725 1.45419 13.0152 1.17418 12.3086C1 11.8691 1 11.3188 1 10.2182V6.2Z" stroke="currentColor" stroke-linejoin="round"/>
                      <path d="M12.0469 7.5C12.0469 8.69662 11.0768 9.66667 9.88021 9.66667C9.44745 9.66667 8.93725 9.59084 8.51649 9.70358C8.14264 9.80375 7.85063 10.0958 7.75046 10.4696C7.63771 10.8904 7.71354 11.4006 7.71354 11.8333C7.71354 13.03 6.74349 14 5.54688 14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.92188 4.25049H8.47187" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.92188 6.84937H5.87187" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  다운로드
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    return li;
  }

  // 미리보기 버튼 클릭 핸들러
  async function handlePreview(courseType, courseId) {
    try {
      const response = await fetch(`${BASE_URL}/certificates/preview/${courseType}/${courseId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`<img src="${url}" alt="Certificate Preview">`);
    } catch (error) {
      console.error("미리보기 요청에 실패했습니다.", error);
    }
  }

  // 다운로드 버튼 클릭 핸들러
  async function handleDownload(courseType, courseId) {
    try {
      const response = await fetch(`${BASE_URL}/certificates/download/${courseType}/${courseId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseType}_certificate_${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("다운로드 요청에 실패했습니다.", error);
    }
  }

  // 데이터 로드 및 렌더링 시작
  fetchCertificates();
});