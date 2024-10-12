import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", initializePage);

function initializePage() {
    const publishButton = document.getElementById("publishButton");
    const accessToken = getCookie('access');

    publishButton.addEventListener("click", handlePublishClick(accessToken));
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function handlePublishClick(accessToken) {
    return function(e) {
        e.preventDefault();

        const courseData = getCourseData();
        if (!isValidCourseData(courseData)) return;

        publishCourse(courseData, accessToken)
            .then(handlePublishSuccess)
            .catch(handlePublishError);
    }
}

function getCourseData() {
    return {
        name: document.getElementById("courseTitle").value,
        price: document.getElementById("coursePrice").value,
    };
}

function isValidCourseData(data) {
    if (!data.name || !data.price) {
        alert("Please fill in both the course title and price.");
        return false;
    }
    return true;
}

function publishCourse(data, accessToken) {
    return fetch(`${BASE_URL}/courses/major-categories/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

function handleResponse(response) {
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: Invalid or expired token");
        }
        throw new Error("Network response was not ok");
    }
    return response.json();
}

function handlePublishSuccess(data) {
    console.log("Success:", data);
    alert("Major코스 등록이 완료 되었습니다. Minor등록 페이지로 이동합니다.");
    clearInputFields();
    setTimeout(() => {
        window.location.href = '/minor-create';  // 로그인 성공 후 redirectUrl로 이동
}, 1000);
}

function handlePublishError(error) {
    console.error("Error:", error);
    if (error.message === "Unauthorized: Invalid or expired token") {
        alert("Your session has expired. Please log in again.");
        // 여기에 로그인 페이지로 리다이렉트하는 로직을 추가할 수 있습니다.
    } else {
        alert("Failed to publish course. Please try again.");
    }
}

function clearInputFields() {
    document.getElementById("courseTitle").value = "";
    document.getElementById("coursePrice").value = "";
}