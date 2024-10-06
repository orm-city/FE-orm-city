import { router } from "../js/router.js"; // router 임포트
import { API_URL } from "../config/config.js"; // config.js에서 API_URL 임포트

export default function MainPage() {
  // 로그인 상태 확인 (쿠키에서 JWT 토큰 확인)
  const token = getCookie("authToken");
  const isLoggedIn = !!token;

  // 페이지 내용
  let html = `
        <h1>메인 페이지</h1>
        <div id="categories">카테고리 로딩 중...</div>
    `;

  // 로그인 상태에 따라 로그인 또는 로그아웃 버튼 추가
  if (!isLoggedIn) {
    html += `
        <button id="loginButton">로그인 화면으로 이동</button>
    `;
  } else {
    html += `
        <button id="logoutButton">로그아웃</button>
    `;
  }

  // HTML을 렌더링
  document.getElementById("app").innerHTML = html;

  // 카테고리 목록 불러오기
  fetchMajorCategories();

  // 로그인 상태가 아닐 경우에만 로그인 버튼 이벤트 리스너 등록
  if (!isLoggedIn) {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", (event) => {
        event.preventDefault();

        router.navigateTo("/signin");
      });
    }
  } else {
    // 로그인 상태일 경우, 로그아웃 버튼 이벤트 리스너 등록
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();

        // 쿠키에서 토큰 제거
        deleteCookie("authToken");
        // 로그인 페이지로 리다이렉트
        router.navigateTo("/");
      });
    }
  }

  return html;
}

async function fetchMajorCategories() {
  try {
    const response = await fetch(`${API_URL}/api/v1/courses/major-categories/`);
    const data = await response.json();
    displayCategories(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

function displayCategories(categories) {
  const container = document.getElementById("categories");
  container.innerHTML = ""; // 이전 내용 제거
  categories.forEach((category) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.textContent = category.name;
    container.appendChild(categoryDiv);
  });
}

// 쿠키에서 특정 쿠키 값을 가져오는 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 쿠키에서 특정 쿠키를 삭제하는 함수
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
