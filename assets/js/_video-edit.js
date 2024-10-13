import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();

document.addEventListener('DOMContentLoaded', () => {
  const pathSegments = window.location.pathname.split('/');
  const majorId = pathSegments[pathSegments.length - 2];
  const minorId = pathSegments[pathSegments.length - 1];

  fetchMinorCourseAndVideos(minorId);
  renderAddVideoButton(majorId, minorId);
});

async function fetchMinorCourseAndVideos(minorId) {
  try {
    const response = await fetch(`${BASE_URL}/courses/minor-categories/${minorId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch minor course: ${response.status} ${response.statusText}`);
    }

    const minorData = await response.json();
    renderMinorCourseDetails(minorData);
    renderVideoList(minorData.videos);
  } catch (error) {
    console.error('Error fetching minor course and videos:', error);
    alert('강의 정보를 불러오는 데 실패했습니다.');
  }
}

function renderMinorCourseDetails(minorData) {
  document.getElementById('minorname').value = minorData.name;
  document.getElementById('minordescription').value = minorData.content;
}

function renderVideoList(videos) {
  const minorCourseList = document.getElementById('minorCourseList');
  minorCourseList.innerHTML = '';

  videos.forEach((video, index) => {
    const videoElement = document.createElement('div');
    videoElement.className = 'video-item';
    videoElement.dataset.id = video.id;
    videoElement.dataset.minor_id = video.minor_category;

    videoElement.innerHTML = `
      <h4>영상 #${index + 1}: ${video.name}</h4>
      <div>
        <div class="tpd-input">
          <label for="videoName_${video.id}">영상 이름</label>
          <input type="text" id="videoName_${video.id}" name="name" value="${video.name}" required>
        </div>
        <div class="tpd-input">
          <label for="videoDescription_${video.id}">영상 설명</label>
          <input type="text" id="videoDescription_${video.id}" name="description" value="${video.description}" required>
        </div>
        <div class="tpd-input" style="display: flex; flex-direction: column; margin-top: 10px;">
          <label for="videoFile_${video.id}">동영상 파일 업로드 (필수)</label>
          <input type="file" id="videoFile_${video.id}" name="video_file" accept="video/*" required>
        </div>
        <div class="tpd-input" style="margin-top: 10px;">
          <label id="videoDuration_${video.id}">길이: ${video.duration}</label>
        </div>
        <button type="button" class="update-video-btn tp-btn-inner" data-id="${video.id}" style="margin: 10px 0px 5px;">수정</button>
        <button type="button" class="delete-video-btn tp-btn-inner" data-id="${video.id}" style="margin: 10px 0px 5px; background-color:#cc1439;">삭제</button>
      </div>
      ${index < videos.length - 1 ? '<hr>' : ''}
    `;

    minorCourseList.appendChild(videoElement);
  });

  // ===== 이벤트 리스너 =====

  // 영상 수정 버튼 이벤트 리스너 추가
  document.querySelectorAll('.update-video-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const videoId = e.target.dataset.id;
      const videoItem = document.querySelector(`.video-item[data-id="${videoId}"]`);
      const name = videoItem.querySelector('input[name="name"]').value;
      const description = videoItem.querySelector('input[name="description"]').value;
      const videoFile = videoItem.querySelector('input[name="video_file"]').files[0];
      const minorCategoryId = videoItem.dataset.minor_id;

      if (!videoFile) {
        alert('동영상 파일은 필수입니다. 파일을 선택해 주세요.');
        return;
      }

      let videoDuration;
      if (videoFile) {
        // Step 1: Get video metadata and prepare for upload
        const totalParts = Math.ceil(videoFile.size / (30 * 1024 * 1024)); // 30MB 단위로 분할
        videoDuration = await getVideoDuration(videoFile);

        if (videoDuration === null) {
          alert('Failed to retrieve video duration.');
          return;
        }

        // Step 2: Initiate multipart upload via the backend
        try {
          const initResponse = await fetch(`${BASE_URL}/videos/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              name: name,
              description: description,
              total_parts: totalParts,
              duration: videoDuration,
              minor_category_id: minorCategoryId
            })
          });

          if (!initResponse.ok) {
            throw new Error('Failed to initiate video update.');
          }

          const initData = await initResponse.json();
          const { upload_id, presigned_urls, filename } = initData;

          if (!upload_id || !presigned_urls) {
            throw new Error('Invalid response from server: Missing upload ID or presigned URLs.');
          }

          // Step 3: Upload each part using the presigned URLs
          const partSize = 30 * 1024 * 1024;
          const parts = [];

          for (let i = 0; i < presigned_urls.length; i++) {
            const partNumber = i + 1;
            const start = i * partSize;
            const end = Math.min(start + partSize, videoFile.size);
            const filePart = videoFile.slice(start, end);

            try {
              const uploadResponse = await fetch(presigned_urls[i].presigned_url, {
                method: 'PUT',
                body: filePart,
              });

              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload part ${partNumber}`);
              }

              const eTag = uploadResponse.headers.get('ETag');
              if (!eTag) {
                throw new Error(`Failed to retrieve ETag for part ${partNumber}`);
              }

              parts.push({ PartNumber: partNumber, ETag: eTag });
            } catch (uploadError) {
              console.error(`Error uploading part ${partNumber}:`, uploadError);
              alert(`Part ${partNumber} 업로드 중 오류가 발생했습니다: ${uploadError.message}`);
              return;
            }
          }

          // Step 4: Complete multipart upload
          const completeResponse = await fetch(`${BASE_URL}/videos/complete-upload/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              upload_id: upload_id,
              filename: filename,
              parts: parts,
              duration: videoDuration
            })
          });

          if (completeResponse.ok) {
            alert('영상이 성공적으로 업데이트되었습니다.');
            document.getElementById(`videoDuration_${videoId}`).textContent = `길이: ${videoDuration}`;
          } else {
            const completeError = await completeResponse.json();
            console.error('Complete multipart upload failed:', completeError);
            throw new Error(`Failed to complete video update: ${completeError.detail || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error updating video:', error);
          alert(`영상 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    });
  });

  // 영상 삭제 버튼 이벤트 리스너 추가
  document.querySelectorAll('.delete-video-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const videoId = e.target.dataset.id;
      if (confirm('정말로 이 영상을 삭제하시겠습니까?')) {
        try {
          await deleteVideo(videoId);
          alert('영상이 성공적으로 삭제되었습니다.');
          e.target.closest('.video-item').remove();
        } catch (error) {
          console.error('Error deleting video:', error);
          alert(`영상 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    });
  });
}

function renderAddVideoButton(majorId, minorId) {
  const addVideoButtonContainer = document.getElementById('addMinorButton');
  addVideoButtonContainer.innerHTML = `
      <a id="addMinorButton" class="tp-btn-inner" href="/admin-course-edit/${majorId}/${minorId}/create">Video 추가</a>`;
}

async function getVideoDuration(file) {
  return new Promise((resolve) => {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      resolve(Math.floor(videoElement.duration));
    };

    videoElement.onerror = () => {
      resolve(null);
    };

    const blobURL = URL.createObjectURL(file);
    videoElement.src = blobURL;
  });
}

async function deleteVideo(videoId) {
  const response = await fetch(`${BASE_URL}/videos/${videoId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete video: ${response.status} ${response.statusText}. Server response: ${errorText}`);
  }

  return true; // 삭제 성공
}