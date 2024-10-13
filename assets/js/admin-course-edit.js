import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();
const pathSegments = window.location.pathname.split('/');
const majorId = pathSegments[pathSegments.length - 1];


document.addEventListener('DOMContentLoaded', () => {
    const majorCourseForm = document.getElementById('majorCourseForm');
    const minorCoursesForm = document.getElementById('minorCoursesForm');
    const minorCourseList = document.getElementById('minorCourseList');
    const addMinorButton = document.getElementById('addMinorButton');
    
    // Major 강의 정보 및 Minor 강의 목록 불러오기
    fetchMajorCourseAndMinors(majorId);

    // Major 강의 수정 제출 이벤트
    majorCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('majorTitle').value;
        const price = document.getElementById('majorPrice').value;
        
        try {
            const updatedCourse = await updateMajorCourse(majorId, name, price);
            console.log('Server response after update:', updatedCourse);
            alert('Major 강의가 성공적으로 업데이트되었습니다.');
        } catch (error) {
            console.error('Error updating major course:', error);
            alert(`Major 강의 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
    });

    // Minor 강의 추가 버튼 이벤트
    addMinorButton.addEventListener('click', () => {
        console.log('Minor 강의 추가 버튼 클릭');
        // 여기에 Minor 강의 추가 폼을 표시하거나 모달을 열 수 있습니다.
    });
});

async function fetchMajorCourseAndMinors(majorId) {
    try {
        const majorData = await fetchMajorCourse(majorId);
        document.getElementById('majorTitle').value = majorData.name;
        document.getElementById('majorPrice').value = majorData.price;

        const minorData = await fetchMinorCourses(majorId);
        renderMinorCourses(minorData, majorId);
    } catch (error) {
        console.error('Error fetching major course and minors:', error);
        alert('강의 정보를 불러오는 데 실패했습니다.');
    }
}

// Major 리스트 불러오기
async function fetchMajorCourse(majorId) {
    const response = await fetch(`${BASE_URL}/courses/major-categories/${majorId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch major course: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}
// Minor 리스트 불러오기
async function fetchMinorCourses(majorId) {
    const response = await fetch(`${BASE_URL}/courses/minor-categories/by-major/${majorId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch minor courses: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}


// major 정보 수정
async function updateMajorCourse(majorId, name, price) {
    const response = await fetch(`${BASE_URL}/courses/major-categories/${majorId}/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: majorId, name, price })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update major course: ${response.status} ${response.statusText}. Server response: ${errorText}`);
    }

    return await response.json();
}


// minor 정보 수정
async function updateMinorCourse(minorId, name, content, order, majorCategoryId) {
    const response = await fetch(`${BASE_URL}/courses/minor-categories/${minorId}/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            content: content,
            order: order,
            major_category: majorCategoryId
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update minor course: ${response.status} ${response.statusText}. Server response: ${errorText}`);
    }

    return await response.json();
}


function renderMinorCourses(minorCourses, majorId) {
    const minorCourseList = document.getElementById('minorCourseList');
    minorCourseList.innerHTML = '';

    minorCourses.forEach((minor, index) => {
        const minorElement = document.createElement('div');
        minorElement.className = 'minor-course-item';
        minorElement.dataset.id = minor.id;

        minorElement.innerHTML = `
            <h3>Minor 강의 #${index + 1}</h3>
            <div>
                <a class="tp-btn-inner" id="publishButton" href="/admin-course-edit/${majorId}/${minor.id}">동영상 관리</a>
            </div>
            <div class="tpd-input">
                <label for="minorName_${minor.id}">Minor 이름</label>
                <input type="text" id="minorName_${minor.id}" name="name" value="${minor.name}" required>
            </div>
            <div class="tpd-input">
                <label for="minorContent_${minor.id}">강의 설명</label>
                <input type="text" id="minorContent_${minor.id}" name="content" value="${minor.content}" required>
            </div>
            <div class="tpd-input">
                <label for="minorOrder_${minor.id}">순서</label>
                <input type="number" id="minorOrder_${minor.id}" name="order" value="${minor.order}" required>
            </div>
            <button type="button" class="update-minor-btn tp-btn-inner" data-id="${minor.id}" style="margin: 10px 0px 5px;">수정</button>
            <button type="button" class="delete-minor-btn tp-btn-inner" data-id="${minor.id}" style="margin: 10px 0px 5px; background-color:#cc1439;">삭제</button>
            ${index < minorCourses.length - 1 ? '<hr>' : ''}
        `;
        minorCourseList.appendChild(minorElement);
    });


    // Minor 삭제 

    async function deleteMinorCourse(minorId) {
        const response = await fetch(`${BASE_URL}/courses/minor-categories/${minorId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete minor course: ${response.status} ${response.statusText}. Server response: ${errorText}`);
        }
    
        return true; // 삭제 성공
    }

// ===== 이벤트 리스너 =====

        // Minor 강의 수정 버튼 이벤트 리스너 추가
        document.querySelectorAll('.update-minor-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const minorId = e.target.dataset.id;
                const minorItem = document.querySelector(`.minor-course-item[data-id="${minorId}"]`);
                const name = minorItem.querySelector('input[name="name"]').value;
                const content = minorItem.querySelector('input[name="content"]').value;
                const order = parseInt(minorItem.querySelector('input[name="order"]').value);
    
                try {
                    await updateMinorCourse(minorId, name, content, order, majorId);
                    alert('Minor 강의가 성공적으로 업데이트되었습니다.');
                } catch (error) {
                    console.error('Error updating minor course:', error);
                    alert(`Minor 강의 업데이트 중 오류가 발생했습니다: ${error.message}`);
                }
            });
        });

        // Minor 강의 삭제 버튼 이벤트 리스너
        document.querySelectorAll('.delete-minor-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const minorId = e.target.dataset.id;
                if (confirm('정말로 이 Minor 강의를 삭제하시겠습니까?')) {
                    try {
                        await deleteMinorCourse(minorId);
                        alert('Minor 강의가 성공적으로 삭제되었습니다.');
                        e.target.closest('.minor-course-item').remove(); // 화면에서 해당 항목 제거
                    } catch (error) {
                        console.error('Error deleting minor course:', error);
                        alert(`Minor 강의 삭제 중 오류가 발생했습니다: ${error.message}`);
                    }
                }
            });
        });
}





