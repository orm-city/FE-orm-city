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

// 로그인 페이지
app.get("/login", (req, res) => {
    const redirectUrl = req.query.redirect || "/";
    res.sendFile(path.join(__dirname, "pages", "_login.html"));
});

// 마이프로필
app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-profile.html"));
});


// 나의 수강 - 수강생
app.get("/student-my-course", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_student-my-course.html"));
});

app.get("/student_active_course", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_student-my-course.html"));
});

// 구매내역
app.get("/my-orders", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-order.html"));
});


// 수료증 진위 확인 페이지
app.get("/certificate/verify", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_certificate-verify.html"));
});

// 미션 확인 페이지
app.get("/mission", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_quiz-list-manager.html"));
});

// 강의 카테고리 보기 
app.get("/course", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_course-categories.html"));
});


// 객관식 문제 생성
app.get("/mcqs", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_edit-mcqs.html"));
});
// 객관식 문제 편집
app.get("/mcqs/:id", (req, res) => {
    const mcqsId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_edit-mcqs.html"));
});


// 코드 제출형 문제 생성
app.get("/code-submissions", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_edit-code-submissions.html"));
});
// 코드 제출형 문제 편집
app.get("/code-submissions/:id", (req, res) => {
    const codesubmissionsId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_edit-code-submissions.html"));
});

// 학생 대시보드(미정)
app.get("/my-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "instructor-dashboard.html"));
});

// 미션 제출 내역
app.get("/course-mission", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-my-quiz.html"));
});

// 미션 제출 내역 전체 (어드민)
app.get("/course-mission/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-my-quiz.html"));
});


app.get("/course-progress", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-enroll-course.html"));
});

app.get("/admin-dashbord", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "instructor-analytics-overview.html"));
});


// 수료증 페이지
app.get("/certificate", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_instructor-certificate.html"));

});

// 프로필 편집
app.get("/edit-profile", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "instructor-setting-profile.html"));
});

// 비밀번호 변경
app.get("/change-password", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "instructor-setting-password.html"));
});

// 회원가입
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_register.html"));
});

// 동적 라우팅 설정: /major/:id 경로 처리
app.get("/major/:id", (req, res) => {
    const majorId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_course-details-2.html"));
});

// 강의를 보여주는 페이지  // 동적 라우팅 설정: /major/:id/videos 경로 처리 
app.get("/major/:id/videos", (req, res) => {
    const majorId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_study-page.html"));
});


// 중간, 기말 과목을 보여주는 경로 동적 라우팅 설정
app.get("/major/:id/:minor_id/:exam_type", (req, res) => {
    const majorId = req.params.id;
    const minorId = parseInt(req.params.minor_id);
    const examType = req.params.exam_type;

    // minor_id가 숫자가 아닌 경우 에러 처리
    if (isNaN(minorId)) {
        return res.status(400).send("minor_id는 숫자여야 합니다.");
    }

    // exam_type이 "mid" 또는 "final"이 아닌 경우 에러 처리
    if (examType !== "mid" && examType !== "final") {
        return res.status(400).send('exam_type은 "mid" 또는 "final"이어야 합니다.');
    }

    // 정상적인 경우 해당 페이지 반환
    res.sendFile(path.join(__dirname, "pages", "_mission-list.html"));
});

// 객관식 문제 페이지 경로 설정
app.get("/major/:id/:minor_id/:exam_type/mcqs/:question_id", (req, res) => {
    const majorId = req.params.id;
    const minorId = parseInt(req.params.minor_id);
    const examType = req.params.exam_type;
    const questionId = parseInt(req.params.question_id);

    // minor_id나 question_id가 숫자가 아닌 경우 에러 처리
    if (isNaN(minorId) || isNaN(questionId)) {
        return res.status(400).send("minor_id와 question_id는 숫자여야 합니다.");
    }

    // exam_type이 "mid" 또는 "final"이 아닌 경우 에러 처리
    if (examType !== "mid" && examType !== "final") {
        return res.status(400).send('exam_type은 "mid" 또는 "final"이어야 합니다.');
    }

    // 정상적인 경우 객관식 페이지 반환
    res.sendFile(path.join(__dirname, "pages", "_mcqs_question.html"));
});

// 주관식 문제 페이지 경로 설정
app.get("/major/:id/:minor_id/:exam_type/cs/:question_id", (req, res) => {
    const majorId = req.params.id;
    const minorId = parseInt(req.params.minor_id);
    const examType = req.params.exam_type;
    const questionId = parseInt(req.params.question_id);

    // minor_id나 question_id가 숫자가 아닌 경우 에러 처리
    if (isNaN(minorId) || isNaN(questionId)) {
        return res.status(400).send("minor_id와 question_id는 숫자여야 합니다.");
    }

    // exam_type이 "mid" 또는 "final"이 아닌 경우 에러 처리
    if (examType !== "mid" && examType !== "final") {
        return res.status(400).send('exam_type은 "mid" 또는 "final"이어야 합니다.');
    }

    // 정상적인 경우 주관식 페이지 반환
    res.sendFile(path.join(__dirname, "pages", "_cs_question.html"));
});



//=======Admin page - start=======

// 1.어드민 대시보드
app.get("/admin-dashbord", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "instructor-analytics-overview.html"));
});


// 2. major 등록
app.get("/major-create", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "_major-course-edit.html"));
});


// 3. minor 강의 등록
app.get("/minor-create", (req, res) => {
    const majorId = req.params.id;
    res.sendFile(path.join(__dirname, "pages", "_minor-course-create.html"));
});

// 4. 등록 수강 목록
app.get("/admin-enroll-course", (req, res) => {
    res.sendFile(
        path.join(__dirname, "pages", "_admin-enroll-course.html")
    );
});


// major 등록수강 수정 
app.get("/admin-course-edit/:id", (req, res) => {
    res.sendFile(
        path.join(__dirname, "pages", "_course-edit.html")
    );
});

// minor 동영상 수정 
app.get("/admin-course-edit/:id/:minor_id", (req, res) => {
    const majorId = req.params.id;
    const minorId = parseInt(req.params.minor_id);
    res.sendFile(
        path.join(__dirname, "pages", "_video-edit.html")
    );
});

// 비디오 생성
app.get("/admin-course-edit/:id/:minor_id/create", (req, res) => {
    const majorId = req.params.id;
    const minorId = parseInt(req.params.minor_id);
    res.sendFile(path.join(__dirname, "pages", "_admin-video-create.html"));
});  

//========Admin page - end========

/*
    에러처리
*/

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
