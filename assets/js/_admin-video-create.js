import { BASE_URL } from './config.js';

// 로그인 상태 확인 및 액세스 토큰 가져오기
window.addEventListener('DOMContentLoaded', () => {
    const jwtToken = getCookie('access');
    if (!jwtToken) {
        handleNotLoggedIn();
    }
});

// 비디오 업로드 폼 제출 핸들러
const videoUploadForm = document.getElementById('videoUploadForm');
if (videoUploadForm) {
    videoUploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const jwtToken = getCookie('access');
        if (!jwtToken) {
            handleNotLoggedIn();
            return;
        }

        const videoName = document.getElementById('videoName').value;
        const videoDescription = document.getElementById('videoDescription').value;
        const videoOrder = document.getElementById('videoOrder').value;
        const videoFile = document.getElementById('videoFile').files[0];

        if (!videoFile) {
            alert("Please select a video file to upload.");
            return;
        }

        // Extract minor category ID from URL
        const urlParts = window.location.pathname.split('/');
        const minorCategoryId = urlParts[3]; // Assuming minor category ID is at this position

        if (!minorCategoryId) {
            alert("Failed to retrieve minor category ID from URL.");
            return;
        }

        // Step 1: Get video duration
        const videoDuration = await getVideoDuration(videoFile);

        if (videoDuration === null) {
            alert("Failed to retrieve video duration.");
            return;
        }

        // Step 2: Send video metadata to the server to start multipart upload
        const PART_SIZE = 30 * 1024 * 1024;  // 30MB
        const totalParts = Math.ceil(videoFile.size / PART_SIZE);

        const createResponse = await fetch(`${BASE_URL}/videos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                name: videoName,
                description: videoDescription,
                order: videoOrder,
                total_parts: totalParts,
                duration: videoDuration,
                minor_category_id: minorCategoryId
            })
        });

        if (!createResponse.ok) {
            alert("Failed to initiate video upload.");
            return;
        }

        const { upload_id, presigned_urls, filename } = await createResponse.json();

        const parts = [];

        for (let i = 0; i < presigned_urls.length; i++) {
            const partNumber = i + 1;
            const start = i * PART_SIZE;
            const end = (i + 1) * PART_SIZE > videoFile.size ? videoFile.size : (i + 1) * PART_SIZE;
            const filePart = videoFile.slice(start, end);

            const uploadResponse = await fetch(presigned_urls[i].presigned_url, {
                method: 'PUT',
                body: filePart,
            });

            if (!uploadResponse.ok) {
                alert(`Failed to upload part ${partNumber}`);
                return;
            }

            const eTag = uploadResponse.headers.get('ETag');
            if (!eTag) {
                alert(`Failed to retrieve ETag for part ${partNumber}`);
                return;
            }

            parts.push({ PartNumber: partNumber, ETag: eTag });

            
        }

        // Step 4: Complete multipart upload
        const completeResponse = await fetch(`${BASE_URL}/videos/complete-upload/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                upload_id: upload_id,
                filename: filename,
                parts: parts
            })
        });

        if (completeResponse.ok) {
            alert("수강 영상 등록이 완료 되었습니다.!");
            window.location.href = '/admin-enroll-course';
        } else {
            const completeError = await completeResponse.json();
            console.error("Complete multipart upload failed: ", completeError);
            alert(`Failed to complete video upload: ${completeError.detail || "Unknown error"}`);
        }
    });
}

// Function to extract video duration using a hidden video element
function getVideoDuration(file) {
    return new Promise((resolve) => {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';

        videoElement.onloadedmetadata = () => {
            window.URL.revokeObjectURL(videoElement.src);  // Release blob URL after use
            resolve(Math.floor(videoElement.duration));  // Return duration in seconds
        };

        videoElement.onerror = () => {
            resolve(null);  // In case of error, return null
        };

        // Create a temporary blob URL and set it as the video source
        const blobURL = URL.createObjectURL(file);
        videoElement.src = blobURL;
    });
}

// Get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Handle not logged in scenario
function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }, 100);
}