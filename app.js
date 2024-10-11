/*
  node js server 구동해주는 파일
*/

const express = require("express"); // require: node_modules 자동으로 읽음 express: 라이브러리
const path = require("path"); // 경로
const app = express(); // express 실행

// 로그 미들웨어: 모든 요청을 콘솔에 출력
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // 다음 미들웨어로 넘김
});

// 정적 파일을 제공하기 위한 설정
console.log(__dirname);
app.use("/assets", express.static(path.join(__dirname, "assets"))); // path.join : 운영체제마다 '/' 표현이 달라서 통합해주는 개념
app.use('/pages', express.static(path.join(__dirname, 'pages')));
// 기본 페이지 라우팅
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_index.html"));
});

/*
  header user menu
  ====================start=========================
*/
// 로그인 페이지
app.get("/login", (req, res) => {
    const redirectUrl = req.query.redirect || "/";
    res.sendFile(path.join(__dirname, "pages", "_login.html"));
});

// 마이프로필
app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-profile.html"));
});

app.get("/my-enroll-course", (req, res) => {
    res.sendFile(
        path.join(__dirname, "pages", "_instructor-enroll-course.html")
    );
});

app.get("/my-course", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-my-course.html"));
});

app.get("/my-orders", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-order.html"));
});

app.get("/my-course/edit", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-course-edit.html"));
});
/*
  header user box
  ====================end============================
*/

// 동적 라우팅 설정: /major/:id 경로 처리
app.get("/major/:id", (req, res) => {
    const majorId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_course-details-2.html"));
});

// 동적 라우팅 설정: /major/:id/videos 경로 처리
app.get("/major/:id/videos", (req, res) => {
    const majorId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_study-page.html"));
});

// 404 처리 핸들러 (라우트가 없을 때)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "pages", "_404.html"));
});

// 일반적인 에러 처리 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // port, ()=> : 실행
    console.log(`Server is running on port ${PORT}`);
});
