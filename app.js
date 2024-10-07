const express = require("express");
const path = require("path");
const app = express();

// 로그 미들웨어: 모든 요청을 콘솔에 출력
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();  // 다음 미들웨어로 넘김
  });

// 정적 파일을 제공하기 위한 설정
app.use("/assets", express.static(path.join(__dirname, "assets")));

// 기본 페이지 라우팅
app.get("/", (req, res) => { //127.0.0.1:3000/
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// 동적 라우팅 설정: /major/:id 경로 처리
app.get("/major/:id", (req, res) => { //127.0.0.1:3000/major/1
  const majorId = req.params.id;
  res.sendFile(path.join(__dirname, "pages", "course-details-2.html"));
});

// Catch-all 라우트 추가
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 