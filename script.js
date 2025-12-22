// ======================
// 1. КОНФИГУРАЦИЯ И ПЕРЕМЕННЫЕ
// ======================
let caughtCharacters = 0;
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;

let currentBonus = 0;
let isLightTheme = false;
let characterInterval;
let currentInstallmentLink = null; 

const CLICKABLE = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const DECOR = ['❄', '✨', '🧊'];

// ======================
// 2. ИНИЦИАЛИЗАЦИЯ (ЗАПУСК ВСЕХ СИСТЕМ)
// ======================
document.addEventListener('DOMContentLoaded', () => {
    checkExpiration(); // Проверка 3 месяцев
    loadSavedData();   // Загрузка темы и бонусов
    initStars();       // Небо
    initSnow();        // Снег
    initTimer();       // Таймер НГ
    setupShopLogic();  // Кнопки покупки и ССЫЛКИ
    startCharacterGame(); // Запуск игры
    updateUI();        // Обновление счетчиков
});

// ======================
// 3. МАГАЗИН И РАССРОЧКА (ОТП БАНК)
// ======================
function setupShopLogic() {
    // Тема
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            isLightTheme = !isLightTheme;
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            initStars();
        };
    }

    // Выбор абонемента
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Защита от клика по летящему персонажу
            if (e.target.closest('.game-character')) return;

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                paymentSection.style.display = 'block';

                // Данные из HTML атрибутов
                const price = this.getAttribute('data-price');
                const installments = this.getAttribute('data-installments');
                const link = this.getAttribute('data-link');

                // Цена на экране
                const priceDisplay = document.getElementById('selected-price');
                if (priceDisplay) priceDisplay.textContent = Number(price).toLocaleString('ru-RU');

                // Настройка кнопки рассрочки
                const instBtn = document.getElementById('installment-btn');
                if (instBtn && installments && installments !== 'Нет') {
                    currentInstallmentLink = link; // Запоминаем конкретную ссылку ОТП
                    const monthsEl = document.getElementById('months');
                    if (monthsEl) monthsEl.textContent = installments + ' мес';
                    instBtn.style.display = 'block';
                } else if (instBtn) {
                    instBtn.style.display = 'none';
                }

                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Вызывается при нажатии "Оформить рассрочку"
function openInstallment() {
    if (currentInstallmentLink) {
        window.open(currentInstallmentLink, '_blank');
    } else {
        alert("Пожалуйста, выберите тариф с рассрочкой");
    }
}

function goBack() {
    const payment = document.getElementById('payment');
    if (payment) payment.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// 4. ЛОГИКА ИГРЫ (НАКОПИТЕЛЬНАЯ)
// ======================
function startCharacterGame() {
    if (characterInterval) clearInterval(characterInterval);
    characterInterval = setInterval(() => {
        const isBonus = Math.random() > 0.5;
        const emoji = isBonus ? CLICKABLE[Math.floor(Math.random() * CLICKABLE.length)] : DECOR[Math.floor(Math.random() * DECOR.length)];
        
        const char = document.createElement('div');
        char.innerHTML = emoji;
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed',
            top: '-60px',
            left: (Math.random() * 80 + 10) + 'vw',
            fontSize: '45px',
            zIndex: '10000',
            cursor: isBonus ? 'pointer' : 'default',
            userSelect: 'none',
            pointerEvents: 'auto',
            animation: `character-fall ${Math.random() * 3 + 6}s linear forwards`
        });

        if (isBonus) {
            const handleAction = (e) => {
                e.preventDefault();
                e.stopPropagation();
                catchCharacter(char);
            };
            char.addEventListener('mousedown', handleAction);
            char.addEventListener('touchstart', handleAction, { passive: false });
        }

        document.body.appendChild(char);
        setTimeout(() => { if(char.parentNode) char.remove(); }, 9000);
    }, 3500);
}

function catchCharacter(char) {
    caughtCharacters++;
    showClickEffect(char, "🎉 +1");
    char.remove();
    updateUI();
    if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        // Фиксируем дату начала отсчета 3 месяцев при первой победе
        if (!localStorage.getItem('bonusStartDate')) {
            localStorage.setItem('bonusStartDate', Date.now());
        }
    }
    localStorage.setItem('totalBonus', currentBonus);
    showRewardPopup();
    caughtCharacters = 0;
    updateUI();
}

// ======================
// 5. ДЕКОР И ИНТЕРФЕЙС
// ======================
function updateUI() {
    const counter = document.getElementById('character-count');
    if (counter) counter.textContent = caughtCharacters;
    const bonusDisplay = document.getElementById('current-bonus-display');
    if (bonusDisplay) bonusDisplay.textContent = currentBonus + " ₽";
}

function initStars() {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    container.innerHTML = '';
    if (isLightTheme) return;
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        container.appendChild(star);
    }
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    if (container) {
        container.style.pointerEvents = 'none';
        setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.innerHTML = '❄';
            flake.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; animation: fall ${Math.random()*5+5}s linear forwards; pointer-events:none; z-index: 5;`;
            container.appendChild(flake);
            setTimeout(() => flake.remove(), 9000);
        }, 800);
    }
}

function initTimer() {
    const timerEl = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    setInterval(() => {
        const diff = target - Date.now();
        if (timerEl && diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            timerEl.textContent = `${d}д ${h}ч ${m}м ${s}с`;
        }
    }, 1000);
}

function showRewardPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:20px; z-index:20000; text-align:center; box-shadow:0 0 50px rgba(0,0,0,0.5); border:5px solid #FFD700; color:#222; width:85%; max-width:400px;";
    div.innerHTML = `
        <h2 style="color:#e67e22; margin-bottom:10px;">${currentBonus >= MAX_BONUS ? '🔥 МАКСИМАЛЬНАЯ СКИДКА!' : '💰 СКИДКА ВАША!'}</h2>
        <p style="font-size: 32px; font-weight: bold; margin: 15px 0;">${currentBonus} ₽</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Она применится при оплате абонемента.</p>
        <button id="close-reward" style="padding:12px 25px; background:#27ae60; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold; width: 100%;">СУПЕР!</button>
    `;
    document.body.appendChild(div);
    document.getElementById('close-reward').onclick = () => div.remove();
}

function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.textContent = text;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:15000; transition: 1s; font-size: 24px; pointer-events:none;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-60px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1000);
}

// ======================
// 6. ХРАНИЛИЩЕ И СРОКИ
// ======================
function checkExpiration() {
    const startDate = localStorage.getItem('bonusStartDate');
    if (startDate) {
        const ninetyDays = 90 * 24 * 60 * 60 * 1000; 
        if (Date.now() - parseInt(startDate) > ninetyDays) {
            localStorage.removeItem('totalBonus');
            localStorage.removeItem('bonusStartDate');
            currentBonus = 0;
        }
    }
}

function loadSavedData() {
    if (localStorage.getItem('theme') === 'light') {
        isLightTheme = true;
        document.body.classList.add('light-theme');
    }
    currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
}
