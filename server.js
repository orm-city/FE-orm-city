const express = require("express");
const path = require("path");
const app = express();

// 정적 파일 서빙 - frontend 디렉토리로 경로 설정
app.use(express.static(path.join(__dirname, "src")));

// 모든 라우팅을 index.html로 리디렉션 (SPA 라우팅 처리)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
