// ======================
// 1. НАСТРОЙКИ И ДАННЫЕ
// ======================
let caughtCharacters = 0;
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
let currentBonus = 0;
let isLightTheme = false;
let currentInstallmentLink = "";

// База ссылок для рассрочки (ОТП Банк)
const INSTALLMENT_LINKS = {
    "12": "https://ecom.otpbank.ru/smart-form?config=42943585-8511-400a-a027-49732f1d8fb2", // 96 зан
    "10": "https://ecom.otpbank.ru/smart-form?config=e0d01fc2-5884-4fb1-b769-c7955a2d3b69", // 64 зан
    "3_32": "https://ecom.otpbank.ru/smart-form?config=737d0db2-fbf7-4b88-b101-0b563090abaf", // 32 зан
    "3_16": "https://ecom.otpbank.ru/smart-form?config=cc7cc8cc-603e-434a-9e44-402e68a41b6f"  // 16 зан
};

// ======================
// 2. ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    checkExpiration();
    loadSavedData();
    
    // Принудительно создаем контейнеры, если их нет
    if (!document.querySelector('.stars-container')) createContainer('stars-container');
    if (!document.querySelector('.snow-container')) createContainer('snow-container');

    initStars();
    initSnow();
    initTimer();
    setupShopLogic();
    startCharacterGame();
    updateUI();
    fixMobileButton(); // Адаптация кнопки "Назад"
});

// ======================
// 3. МАГАЗИН И РАССРОЧКА
// ======================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            isLightTheme = !isLightTheme;
            document.body.classList.toggle('light-theme', isLightTheme);
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            initStars(); // Перерисовываем звезды (скрываем их на светлой теме)
        };
    }

    document.querySelectorAll('.card').forEach(card => {
        card.onclick = function(e) {
            if (e.target.closest('.game-character')) return;

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                paymentSection.style.display = 'block';
                const price = this.getAttribute('data-price');
                const installments = this.getAttribute('data-installments');
                const lessons = this.innerText.toLowerCase(); // Проверяем кол-во занятий

                // Умный подбор ссылки
                if (installments === "12") currentInstallmentLink = INSTALLMENT_LINKS["12"];
                else if (installments === "10") currentInstallmentLink = INSTALLMENT_LINKS["10"];
                else if (installments === "3") {
                    currentInstallmentLink = lessons.includes("32") ? INSTALLMENT_LINKS["3_32"] : INSTALLMENT_LINKS["3_16"];
                }

                document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
                const instBtn = document.getElementById('installment-btn');
                if (instBtn && installments !== 'Нет') {
                    document.getElementById('months').textContent = installments + ' мес';
                    instBtn.style.display = 'block';
                } else if (instBtn) {
                    instBtn.style.display = 'none';
                }

                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    });
}

function openInstallment() {
    if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank');
}

function goBack() {
    const payment = document.getElementById('payment');
    if (payment) payment.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// 4. ДЕКОРАЦИИ (ЗВЕЗДЫ И СНЕГ)
// ======================
function initStars() {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    container.innerHTML = '';
    if (isLightTheme) return; // На светлой теме звезды не нужны

    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            width: 2px; height: 2px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random()};
            animation: twinkle ${2 + Math.random() * 3}s infinite;
        `;
        container.appendChild(star);
    }
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    if (!container) return;
    
    // Снег падает чаще (интервал 300мс вместо 800мс)
    setInterval(() => {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * 100}vw;
            z-index: 5;
            pointer-events: none;
            color: white;
            opacity: ${0.3 + Math.random() * 0.7};
            font-size: ${10 + Math.random() * 15}px;
            animation: fall ${5 + Math.random() * 5}s linear forwards;
        `;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 300); 
}

// ======================
// 5. ИГРА И UI
// ======================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.5;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer', pointerEvents: 'auto',
            animation: `character-fall ${7 + Math.random() * 3}s linear forwards`
        });

        if (isBonus) {
            const catchFn = (e) => { e.preventDefault(); e.stopPropagation(); caughtCharacters++; updateUI(); char.remove(); if(caughtCharacters >= 10) processWin(); };
            char.onmousedown = catchFn;
            char.ontouchstart = catchFn;
        }
        document.body.appendChild(char);
        setTimeout(() => char.remove(), 10000);
    }, 3000);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        if (!localStorage.getItem('bonusStartDate')) localStorage.setItem('bonusStartDate', Date.now());
    }
    localStorage.setItem('totalBonus', currentBonus);
    updateUI();
    alert(`🎉 Уровень пройден! Ваша накопленная скидка: ${currentBonus} ₽`);
    caughtCharacters = 0;
    updateUI();
}

function updateUI() {
    const c = document.getElementById('character-count');
    if (c) c.textContent = caughtCharacters;
    const b = document.getElementById('current-bonus-display');
    if (b) b.textContent = currentBonus + " ₽";
}

// ======================
// 6. СЕРВИСНЫЕ ФУНКЦИИ
// ======================
function fixMobileButton() {
    // Удлиняем кнопку "Назад" в блоке оплаты для мобильных
    const backBtn = document.querySelector('.back-button') || document.querySelector('button[onclick="goBack()"]');
    if (backBtn) {
        backBtn.style.minWidth = "280px";
        backBtn.style.padding = "15px 20px";
    }
}

function createContainer(cls) {
    const d = document.createElement('div');
    d.className = cls;
    document.body.prepend(d);
}

function checkExpiration() {
    const s = localStorage.getItem('bonusStartDate');
    if (s && (Date.now() - parseInt(s) > 90 * 24 * 60 * 60 * 1000)) {
        localStorage.clear();
        currentBonus = 0;
    }
}

function loadSavedData() {
    isLightTheme = localStorage.getItem('theme') === 'light';
    if (isLightTheme) document.body.classList.add('light-theme');
    currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
}

function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    setInterval(() => {
        const diff = target - Date.now();
        if (t && diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            t.textContent = `${d}д ${h}ч ${m}м ${s}с`;
        }
    }, 1000);
}
