import { BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = getCookie('access');
    if (!accessToken) {
        handleNotLoggedIn();
        return;
    }

    const majorId = extractMajorIdFromUrl();
    if (majorId) {
        await fetchAndSetMajorCategoryName(majorId);
    } else {
        console.error("major_id를 URL에서 찾을 수 없습니다.");
    }

    fetchAndRenderMinorCategories(majorId, accessToken);
    goBack(majorId);
});

// 1. 쿠키에서 accessToken 추출 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 2. 로그인이 안 되어 있을 때 처리하는 함수
function handleNotLoggedIn() {
    alert("You must log in first.");
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

// 3. URL에서 major_id 추출하는 함수
function extractMajorIdFromUrl() {
    const currentUrl = window.location.pathname; // 예: /major/1/videos
    const majorIdMatch = currentUrl.match(/\/major\/(\d+)\/videos(\/|$)/);
    return majorIdMatch ? majorIdMatch[1] : null;
}

// 4. major_id로 API 호출 후 카테고리 이름 설정
async function fetchAndSetMajorCategoryName(majorId) {
    const accessToken = getCookie('access'); // 쿠키에서 accessToken 가져오기
    try {
        const response = await fetch(`${BASE_URL}/courses/major-categories/${majorId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // accessToken을 Authorization 헤더에 추가
            }
        });

        const data = await response.json();
        const majorCategoryNameElement = document.getElementById('major-category-name');
        
        if (data.name) {
            majorCategoryNameElement.textContent = data.name;
        } else {
            console.error("응답 데이터에 'name' 속성이 없습니다.");
        }
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
    }
}

let progressInterval;

// 5. 비디오 불러오기 및 설정
async function loadVideo(videoId, accessToken) {
    try {
        const retrieveResponse = await fetch(`${BASE_URL}/videos/${videoId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!retrieveResponse.ok) {
            alert("Failed to load video.");
            window.location.href = '/';
            return;
        }

        const retrieveData = await retrieveResponse.json();
        const { video_url, last_position, description } = retrieveData;

        const videoElement = document.getElementById('videoPlayer');
        const videoDescriptionElement = document.getElementById('videoDescription');

        videoElement.src = video_url;
        videoDescriptionElement.textContent = description;

        videoElement.addEventListener('loadedmetadata', () => {
            if (last_position >= 0 && last_position < videoElement.duration) {
                videoElement.currentTime = last_position;
            }
            document.getElementById('videoPlayerContainer').style.display = 'block';

            if (progressInterval) {
                clearInterval(progressInterval);
            }

            progressInterval = setInterval(() => updateProgress(videoId, accessToken), 10000); // 10초마다 진행률 업데이트
        });
    } catch (error) {
        console.error('비디오 로드 중 오류 발생:', error);
    }
}

// 6. 비디오 목록을 HTML로 변환하고 클릭 이벤트 처리
function renderVideos(videos, majorId, minorId, accessToken) {
    if (videos.length === 0) {
        return '<p>비디오가 없습니다.</p>';
    }


    const midIndex = Math.ceil(videos.length / 2 -1);

    return videos.map((video, index) => {
        let linkHtml = `
            <a href="#" class="video-link" data-video-id="${video.id}">
                <p>${video.name}</p>
                <div class="time">${video.duration}</div>
            </a>
        `;

        // 중간 미션 링크 추가
        if (index === midIndex) {
            linkHtml += `
                <a href="/major/${majorId}/${minorId}/mid" class="mission-link">
                    <p>중간 미션</p>
                </a>
            `;
        }

        // 마지막 비디오 다음에 기말 미션 링크 추가
        if (index === videos.length - 1) {
            linkHtml += `
                <a href="/major/${majorId}/${minorId}/final" class="mission-link">
                    <p>기말 미션</p>
                </a>
            `;
        }

        return linkHtml;
    }).join('');
}

// 7. API로 데이터를 받아와 HTML을 동적으로 채우고 첫 번째 비디오 자동 로드
async function fetchAndRenderMinorCategories(majorId, accessToken) {
    try {
        const response = await fetch(`${BASE_URL}/courses/minor-categories/by-major/${majorId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error(`API 요청 실패: 상태 코드 ${response.status}`);
            return;
        }

        const data = await response.json();
        const accordionContainer = document.getElementById('accordionExample');

        data.forEach((minorCategory, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion-item');
            const minorCategoryId = `collapse${index}`;
            const minorCategoryHeadingId = `heading${index}`;

            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="${minorCategoryHeadingId}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${minorCategoryId}" aria-expanded="true" aria-controls="${minorCategoryId}">
                        ${minorCategory.name}
                    </button>
                </h2>
                <div id="${minorCategoryId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="${minorCategoryHeadingId}" data-bs-parent="#accordionExample">
                    <div class="tpd-continue-learning-body">
                        <div class="tpd-continue-learning-body-item" id="video-list-${minorCategory.id}">
                            ${renderVideos(minorCategory.videos, majorId, minorCategory.id, accessToken)}
                        </div>
                    </div>
                </div>
            `;

            accordionContainer.appendChild(accordionItem);

            // 첫 번째 minor 카테고리의 첫 번째 비디오를 자동으로 로드
            if (index === 0 && minorCategory.videos.length > 0) {
                const firstVideoId = minorCategory.videos[0].id;
                loadVideo(firstVideoId, accessToken); // 첫 번째 비디오 로드
            }
        });

        // 비디오 클릭 이벤트 핸들러 등록
        document.querySelectorAll('.video-link').forEach(videoLink => {
            videoLink.addEventListener('click', function (event) {
                event.preventDefault();
                const videoId = this.getAttribute('data-video-id');
                handleVideoClick(videoId, accessToken);
            });
        });

    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
    }
}

// 8. 비디오 목록에서 비디오 클릭 시 해당 비디오 재생
async function handleVideoClick(videoId, accessToken) {
    await loadVideo(videoId, accessToken);
}

// 9. 자동으로 진행률을 서버로 업데이트하는 함수
async function updateProgress(videoId, accessToken) {
    const videoElement = document.getElementById('videoPlayer');
    if (!accessToken || !videoElement) {
        return;
    }

    const progressPercent = Math.round((videoElement.currentTime / videoElement.duration) * 100);
    const timeSpent = Math.floor(videoElement.currentTime);
    const lastPosition = Math.floor(videoElement.currentTime);
    const requestData = {
        video_id: videoId,
        progress_percent: progressPercent,
        time_spent: timeSpent,
        last_position: lastPosition
    };

    console.log(`Updating progress: ${progressPercent}% at position ${timeSpent} seconds`);

    const progressResponse = await fetch(`${BASE_URL}/videos/progress/${videoId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
    });

    if (!progressResponse.ok) {
        const errorData = await progressResponse.json();
        console.error("Failed to update progress: ", errorData);
    }
}

// 10. 원래 페이지로 돌아가기
function goBack(majorId) {
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.href = `/major/${majorId}`;
    }
}

// 11. 비디오가 중단되거나 종료될 때 interval을 정리
window.addEventListener('beforeunload', () => {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});
