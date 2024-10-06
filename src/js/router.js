// router.js
import MainPage from "../components/MainPage.js";
import SignInPage from "../components/SignInPage.js";
import SignUpPage from "../components/SignUpPage.js";

const routes = {
  "/": MainPage,
  "/signin": SignInPage,
  "/signup": SignUpPage,
};

export const router = {
  navigateTo(url) {
    console.log("Navigating to:", url);
    history.pushState(null, null, url);
    this.loadPage(url);
  },
  loadPage(url) {
    const route = routes[url] || MainPage;
    route(); // 페이지 함수를 직접 호출하여 이벤트 리스너 등록 등 수행
    console.log("Page loaded:", url);
  },
};

// 브라우저의 뒤로가기, 앞으로가기 이벤트 처리
window.addEventListener("popstate", () => {
  router.loadPage(location.pathname);
});

// 초기 로드 시 현재 경로에 맞는 페이지 로드
document.addEventListener("DOMContentLoaded", () => {
  router.loadPage(location.pathname);
});
