import { router } from "../js/router.js"; // router 임포트
import { API_URL } from "../config/config.js"; // config.js에서 API_URL 임포트

export default function SignUpPage() {
  // 회원가입 API 호출
  async function signUp(event) {
    event.preventDefault(); // 기본 제출 동작 방지
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_URL}/api/v1/accounts/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        // 회원가입 성공 시 로그인 페이지로 이동
        router.navigateTo("/signin");
      } else {
        document.getElementById("error-message").textContent =
          "회원가입 실패. 다시 시도하세요.";
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  }

  // 페이지 내용
  const html = `
        <h1>회원가입</h1>
        <form id="signup-form">
            <input type="text" id="username" placeholder="아이디" required />
            <input type="email" id="email" placeholder="이메일" required />
            <input type="password" id="password" placeholder="비밀번호" required />
            <button type="submit">회원가입</button>
            <div id="error-message"></div>
        </form>
    `;

  // HTML을 렌더링
  document.getElementById("app").innerHTML = html;

  // HTML 렌더링 후 이벤트 리스너 등록
  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", signUp);
  } else {
    console.error("Signup form not found");
  }

  return html;
}
