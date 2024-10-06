import { router } from "../js/router.js"; // router 임포트
import { API_URL } from "../config/config.js"; // config.js에서 API_URL 임포트

export default function SignInPage() {
  // 로그인 API 호출
  async function signIn(event) {
    event.preventDefault(); // 기본 제출 동작 방지
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_URL}/api/v1/accounts/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // JWT 토큰을 쿠키에 저장 (만료 시간은 예시로 1시간 설정)
        setCookie("authToken", data.token, 1);

        // 메인 페이지로 이동
        router.navigateTo("/");
      } else {
        document.getElementById("error-message").textContent =
          "로그인 실패. 다시 시도하세요.";
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  const html = `
    <h1>로그인</h1>
    <form id="signin-form">
        <input type="text" id="email" placeholder="이메일" required autocomplete="email" />
        <input type="password" id="password" placeholder="비밀번호" required autocomplete="off" />
        <button type="submit">로그인</button>
        <div id="error-message"></div>
    </form>
    <button id="signupButton">회원가입 화면으로 이동</button>
  `;

  document.getElementById("app").innerHTML = html;

  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", signIn);
  }

  // 회원가입 버튼 클릭 시 회원가입 화면으로 이동
  const signupButton = document.getElementById("signupButton");
  if (signupButton) {
    signupButton.addEventListener("click", () => {
      router.navigateTo("/signup");
    });
  }

  return html;
}

// 쿠키를 설정하는 함수 (expires는 시간 단위로 설정)
function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Strict`;
}
