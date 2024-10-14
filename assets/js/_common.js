import { BASE_URL } from './config.js';
import { getAccessToken } from './_getCookieUtils.js';

const accessToken = getAccessToken();

async function getCurrentUserRole() {
    try {
        if (!accessToken) {
            console.log('액세스 토큰이 없습니다. 로그인이 필요합니다.');
            return null;
        }
        const response = await fetch(`${BASE_URL}/accounts/check-role/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const userRoleInfo = await response.json();
        return userRoleInfo.role; // 사용자 역할 반환
    } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
        return null;
    }
}

// 네비게이션 메뉴를 동적으로 업데이트하는 함수
async function updateNavigation() {
    const role = await getCurrentUserRole();
    const headerUserList = document.querySelector('.tp-header-user-list ul');

    if (!headerUserList) {
        console.error('Header user list element not found');
        return;
    }

    // 모든 메뉴 아이템을 가져옵니다.
    const menuItems = headerUserList.querySelectorAll('li');

    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const menuText = link.textContent.trim();

            if (role === 'admin') {
                // Admin 사용자를 위한 메뉴 처리
                switch (menuText) {
                    case '어드민 대시보드':
                    case '로그아웃':
                        item.style.display = 'block';
                        break;
                    default:
                        item.style.display = 'none';
                }
            } else if (role) {
                // 일반 로그인 사용자를 위한 메뉴 처리
                switch (menuText) {
                    case '어드민 대시보드':
                        item.style.display = 'none';
                        break;
                    case '로그인':
                        item.style.display = 'none';
                        break;
                    default:
                        item.style.display = 'block';
                }
            } else {
                // 로그인하지 않은 사용자를 위한 메뉴 처리
                switch (menuText) {
                    case '로그인':
                        item.style.display = 'block';
                        break;
                    case '로그아웃':
                    case '어드민 대시보드':
                        item.style.display = 'none';
                        break;
                    default:
                        item.style.display = 'block';
                }
            }
        }
        updateSidebar()
    });

}

async function updateSidebar() {
    const role = await getCurrentUserRole();
    
    // 모든 사이드바를 숨깁니다
    document.getElementById('adminSidebar').style.display = 'none';
    document.getElementById('studentSidebar').style.display = 'none';
    
    // 역할에 따라 적절한 사이드바를 표시합니다
    if (role === 'admin') {
        document.getElementById('adminSidebar').style.display = 'block';
    } else if (role === 'student') {
        document.getElementById('studentSidebar').style.display = 'block';
    }
}

// 페이지 로드 시 사이드바 업데이트
document.addEventListener('DOMContentLoaded', updateSidebar);

// 페이지 로드 시 네비게이션 메뉴와 사이드바 업데이트
document.addEventListener('DOMContentLoaded', updateNavigation);