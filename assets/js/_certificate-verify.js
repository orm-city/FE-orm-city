import { BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function() {
    // URL 파라미터에서 certificate_id 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const certificateId = urlParams.get('certificate_id');

    if (!certificateId) {
        document.getElementById('result').innerHTML = '<h2>유효한 수료증 ID가 없습니다.</h2>';
        return;
    }

    // 백엔드 API URL
    const apiUrl = `${BASE_URL}/certificates/verify/${certificateId}/`;

    // API 호출하여 수료증 정보 확인 
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.is_valid) {
                // 수료증이 유효할 경우, decrypted_data 파싱
                const decryptedData = data.decrypted_data;
                const [user, course, issuedAt] = parseDecryptedData(decryptedData);

                // 수료증 정보를 화면에 표시
                document.getElementById("result").innerHTML = `
                    <h2>유효한 수료증입니다!</h2>
                    <p><strong>사용자:</strong> ${user}</p>
                    <p><strong>코스:</strong> ${course}</p>
                    <p><strong>발급일:</strong> ${issuedAt}</p>
                `;
            } else {
                // 수료증이 유효하지 않을 경우
                document.getElementById("result").innerHTML = "<h2>유효하지 않은 수료증입니다.</h2>";
            }
        })
        .catch(error => {
            // API 호출 실패 시 오류 처리
            document.getElementById("result").innerHTML = "<h2>수료증 정보를 가져오는 중 오류가 발생했습니다.</h2>";
            console.error('Error:', error);
        });
});

// decrypted_data에서 정보를 추출하는 함수
function parseDecryptedData(decryptedData) {
    const userMatch = decryptedData.match(/User: (.*?),/);
    const courseMatch = decryptedData.match(/Course: (.*?),/);
    const issuedAtMatch = decryptedData.match(/Issued At: (.*)$/);

    const user = userMatch ? userMatch[1] : "N/A";
    const course = courseMatch ? courseMatch[1] : "N/A";
    const issuedAt = issuedAtMatch ? issuedAtMatch[1] : "N/A";

    return [user, course, issuedAt];
}