document.addEventListener("DOMContentLoaded", () => {
    const char1 = document.getElementById('char-1'); // 초성
    const char2 = document.getElementById('char-2'); // 중성
    const char3 = document.getElementById('char-3'); // 종성

    function animateComplexTypography() {

        // --- 1단계: 산 ---
        char1.textContent = 'ㅅ';
        char2.textContent = 'ㅏ';
        char3.textContent = 'ㄴ';
        char3.style.opacity = 1;

        // --- 2단계: 싼 ---
        setTimeout(() => {
            char1.textContent = 'ㅆ';  // 초성 빠르게 변화
            char2.textContent = 'ㅏ';  
            char3.style.opacity = 0.8; 
        }, 300);

        setTimeout(() => {
            char1.textContent = 'ㅆ';
            char2.textContent = 'ㅣ';  // 중성 변화
            char3.style.opacity = 0.6; 
        }, 600);

        // --- 3단계: 딴 ---
        setTimeout(() => {
            char1.textContent = 'ㄸ';
            char2.textContent = 'ㅣ';
            char3.style.opacity = 0;   // 종성 사라짐
        }, 900);
    }

    // 최초 실행
    animateComplexTypography();

    // 반복 실행
    setInterval(animateComplexTypography, 1500);
});
