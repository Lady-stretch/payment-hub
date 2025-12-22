// ======================
// ПЕРЕМЕННЫЕ СОСТОЯНИЯ
// ======================
let caughtCharacters = 0;
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;

let currentBonus = 0;
let isLightTheme = false;
let characterInterval;
let currentInstallment = null;

const CLICKABLE = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const DECOR = ['❄', '✨', '🧊'];

// ======================
// ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    checkExpiration(); // Проверка сброса скидки (3 месяца)
    loadSettings();
    initStars();
    initDecorativeSnow();
    initTimer();
    setupEventListeners(); // Настройка кнопок покупки и темы
    startCharacterGame();
    updateUI();
});

// ======================
// 1. ПРОДАЖИ И ПЕРЕХОДЫ (КНОПКИ)
// ======================
function setupEventListeners() {
    // Переключатель темы
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            isLightTheme = !isLightTheme;
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            initStars();
        };
    }

    // ЛОГИКА КАРТОЧЕК АБОНЕМЕНТОВ
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Если кликнули по персонажу, не открываем оплату
            if (e.target.closest('.game-character')) return;

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                // 1. Показываем блок оплаты
                paymentSection.style.display = 'block';

                // 2. Подставляем цену из атрибута data-price
                const price = this.getAttribute('data-price');
                const priceDisplay = document.getElementById('selected-price');
                if (priceDisplay) priceDisplay.textContent = Number(price).toLocaleString('ru-RU');

                // 3. Настраиваем рассрочку
                const instBtn = document.getElementById('installment-btn');
                const monthsAttr = this.getAttribute('data-installments');
                if (instBtn && monthsAttr && monthsAttr !== 'Нет') {
                    currentInstallment = this.getAttribute('data-link');
                    document.getElementById('months').textContent = monthsAttr + ' мес';
                    instBtn.style.display = 'block';
                } else if (instBtn) {
                    instBtn.style.display = 'none';
                }

                // 4. Плавный скролл к оплате
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Функции для кнопок внутри блока оплаты
function openInstallment() {
    if (currentInstallment) window.open(currentInstallment, '_blank');
}

function goBack() {
    const payment = document.getElementById('payment');
    if (payment) payment.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// 2. ЛОГИКА ИГРЫ (НАКОПИТЕЛЬНАЯ)
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
                e.stopPropagation(); // Важно: чтобы не сработал клик по карте под персонажем
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
    showEffect(char, "🎉 +1");
    char.remove();
    updateUI();
    
    if (caughtCharacters >= CHARACTERS_PER_LEVEL) {
        processWin();
    }
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        if (!localStorage.getItem('bonusStartDate')) {
            localStorage.setItem('bonusStartDate', Date.now());
        }
    }
    localStorage.setItem('totalBonus', currentBonus);
    showRewardWindow();
    caughtCharacters = 0;
    updateUI();
}

function updateUI() {
    const counter = document.getElementById('character-count');
    if (counter) counter.textContent = caughtCharacters;
    
    const bonusDisplay = document.getElementById('current-bonus-display');
    if (bonusDisplay) bonusDisplay.textContent = currentBonus + " ₽";
}

// ======================
// 3. ДЕКОРАЦИИ И СЕРВИСЫ
// ======================
function checkExpiration() {
    const startDate = localStorage.getItem('bonusStartDate');
    if (startDate) {
        const ninetyDays = 90 * 24 * 60 * 60 * 1000; 
        if (Date.now() - parseInt(startDate) > ninetyDays) {
            localStorage.clear(); // Сброс всего прогресса через 3 месяца
            currentBonus = 0;
        }
    }
}

function initStars() {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    container.innerHTML = '';
    if (isLightTheme) return;
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        container.appendChild(star);
    }
}

function initDecorativeSnow() {
    const container = document.querySelector('.snow-container');
    if (container) {
        container.style.pointerEvents = 'none';
        setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.innerHTML = '❄';
            flake.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; animation: fall ${Math.random()*5+5}s linear forwards; pointer-events:none;`;
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

function showRewardWindow() {
    const winBox = document.createElement('div');
    winBox.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:20px; z-index:20000; text-align:center; box-shadow:0 0 50px rgba(0,0,0,0.5); border:5px solid #FFD700; color:#222; width:85%; max-width:400px;";
    winBox.innerHTML = `
        <h2 style="color:#e67e22; margin-bottom:10px;">${currentBonus >= MAX_BONUS ? '🔥 МАКСИМУМ!' : '💰 СКИДКА ВАША!'}</h2>
        <p style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">${currentBonus} ₽</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Используйте при покупке абонемента!</p>
        <button id="close-reward" style="padding:12px 25px; background:#27ae60; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold; width: 100%;">ПРОДОЛЖИТЬ</button>
    `;
    document.body.appendChild(winBox);
    document.getElementById('close-reward').onclick = () => winBox.remove();
}

function showEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.textContent = text;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:15000; transition: 1s; font-size: 24px; pointer-events:none;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-60px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1000);
}

function loadSettings() {
    if (localStorage.getItem('theme') === 'light') {
        isLightTheme = true;
        document.body.classList.add('light-theme');
    }
    currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
}
