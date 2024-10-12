import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();
const MAJOR_SELECT_ID = 'majorCategorySelect';
const MINOR_FORM_ID = 'minorCategoryForm';
const SELECT_ID = 'majorCategorySelect';

// 대분류 코스 가져오기 함수
async function fetchMajorCategories() {
    console.log('Fetching major categories...');
    try {
        const response = await fetch(`${BASE_URL}/courses/major-categories/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const majorCategories = await response.json();
        console.log('Fetched categories:', majorCategories);
        return majorCategories;
    } catch (error) {
        console.error('Error in fetchMajorCategories:', error);
        throw error;
    }
}

// 대분류 선택 박스 채우기 함수
function populateCategorySelect(categories) {
    console.log('Populating category select...');
    const select = document.getElementById(SELECT_ID);
    
    if (!select) {
        console.error(`Select element with id "${SELECT_ID}" not found`);
        return;
    }
    
    select.innerHTML = '<option value="Default">대분류 코스 선택</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;  // ID로 수정
        option.textContent = category.name;
        select.appendChild(option);
    });
    
    console.log('Category select populated');
    initNiceSelect();
}

function showLoading(isLoading) {
    const select = document.getElementById(SELECT_ID);
    if (!select) {
        console.error(`Select element with id "${SELECT_ID}" not found in showLoading`);
        return;
    }
    if (isLoading) {
        select.disabled = true;
        select.innerHTML = '<option value="Default">Loading...</option>';
    } else {
        select.disabled = false;
    }
    initNiceSelect();
}

function initNiceSelect() {
    const select = document.getElementById(SELECT_ID);
    if (select) {
        if ($.fn.niceSelect) {
            $(select).niceSelect('destroy');
            $(select).niceSelect();
        } else {
            console.error('Nice Select plugin not found');
        }
    }
}

async function initializeCategorySelect() {
    console.log('Initializing category select...');
    try {
        showLoading(true);
        const categories = await fetchMajorCategories();
        populateCategorySelect(categories);
    } catch (error) {
        console.error('Error in initializeCategorySelect:', error);
        const select = document.getElementById(SELECT_ID);
        if (select) {
            select.innerHTML = '<option value="Default">Error loading categories</option>';
            initNiceSelect();
        }
    } finally {
        showLoading(false);
    }
}

function onAllScriptsLoaded() {
    console.log('All scripts loaded, initializing category select...');
    initializeCategorySelect();
}

if (document.readyState === 'complete') {
    onAllScriptsLoaded();
} else {
    window.addEventListener('load', onAllScriptsLoaded);
}

console.log('Script loaded');

// 소분류 코스 등록 함수
function getMajorCategoryId() {
    const majorSelect = document.getElementById(MAJOR_SELECT_ID);
    return majorSelect ? majorSelect.value : null;
}

async function registerMinorCategory(event) {
    event.preventDefault();
    
    const name = document.getElementById('courseTitle').value;
    const content = document.getElementById('courseContent').value;
    const order = document.getElementById('courseOrder').value;
    const majorCategoryId = getMajorCategoryId();

    if (!name || !content || !order || !majorCategoryId || majorCategoryId === 'Default') {
        alert('모든 필드를 채우고 대분류 코스를 선택해주세요.');
        return;
    }

    const minorCategoryData = {
        name: name,
        content: content,
        order: parseInt(order),
        major_category: parseInt(majorCategoryId)
    };

    try {
        const response = await fetch(`${BASE_URL}/courses/minor-categories/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(minorCategoryData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Minor category registered:', result);
        alert('소분류 코스가 성공적으로 등록되었습니다.');
        
        // 폼 초기화
        document.getElementById('courseTitle').value = '';
        document.getElementById('courseContent').value = '';
        document.getElementById('courseOrder').value = '';
    } catch (error) {
        console.error('Error registering minor category:', error);
        alert('소분류 코스 등록에 실패했습니다. 다시 시도해주세요.');
    }
}

function initializeMinorCategoryForm() {
    const form = document.getElementById(MINOR_FORM_ID);
    if (form) {
        form.addEventListener('submit', registerMinorCategory);
    } else {
        console.error('Minor category form not found');
    }
}

// 문서가 로드되면 초기화 함수 실행
document.addEventListener('DOMContentLoaded', initializeMinorCategoryForm);

console.log('Minor category registration script loaded');
