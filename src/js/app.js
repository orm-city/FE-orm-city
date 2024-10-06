import { router } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  // 네비게이션 링크 클릭 시 라우팅 처리
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      router.navigateTo(event.target.href);
    }
  });

  // 브라우저 뒤로가기 처리
  window.addEventListener("popstate", () => {
    router.loadPage(location.pathname);
  });

  // 페이지 초기 로드
  router.loadPage(location.pathname);
});
