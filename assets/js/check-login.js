import { BASE_URL } from './config.js';

// 쿠키에서 JWT 토큰 가져오기
function getCookie(name) {
   let cookieValue = null;
   if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
         }
      }
   }
   return cookieValue;
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener("DOMContentLoaded", function() {
   var authLink = document.getElementById("auth-link");
   var authText = document.getElementById("auth-text");

   const jwtToken = getCookie('access');  // 쿠키에서 access_token을 가져옴

   if (jwtToken) {
      // access 토큰이 있으면 로그인 상태로 간주
      authText.textContent = "로그아웃";

      // 로그아웃 클릭 시 처리
      authLink.addEventListener("click", async function(event) {
         event.preventDefault();
         // 로그아웃 API 호출
         const accessToken = getCookie('access');
         const refreshToken = getCookie('refresh');
         try {
            const logoutResponse = await fetch(`${BASE_URL}/accounts/logout/`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
               },
               credentials: 'include',  // 쿠키 포함
               body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (logoutResponse.ok) {
               // 로그아웃 성공 시 쿠키 삭제 및 메인 페이지로 이동
               document.cookie = 'access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
               document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
               window.location.href = '/';
            } else {
               console.error('로그아웃 실패:', logoutResponse.statusText);
            }
         } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
         }
      });
   } else {
      // JWT 토큰이 없을 경우 로그인 페이지로 이동
      authLink.href = "/login";
      authText.textContent = "로그인";
   }
});