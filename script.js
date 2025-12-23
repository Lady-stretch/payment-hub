// ======================
// 1. НАСТРОЙКИ И ССЫЛКИ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Удачи!", "Красоты!", "Силы!", "Счастья!", "Успеха!", "Энергии!"];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = "";

// Ссылки на 2026 год
const LINKS_2026 = {
    "12_64": "https://ecom.otpbank.ru/smart-form?config=b0e1d97a-e60c-4559-9fd8-5666fe5f40ed",
    "6_32": "https://ecom.otpbank.ru/smart-form?config=293fedad-a411-411d-8b5e-0747e82f6c73",
    "card": "https://checkout.tochka.com/b880ee38-1c68-4215-85e8-1ca8081ec51a"
};

// ======================
// 2. ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    checkExpiration();
    applyTheme();
    initStars();
    initSnow();
    initTimer();
    setupShopLogic();
    startCharacterGame();
    updateUI();
    
    // Если уже 2026 год — запускаем конфетти и меняем тексты
    if (new Date().getFullYear() >= 2026) {
        launchConfetti();
        updateToNewYearMode();
    }
});

// ======================
// 3. ЛОГИКА ПРОДАЖ И БЛОКИРОВКИ
// ======================
function setupShopLogic() {
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = function(e) {
            if (e.target.closest('.game-character')) return;

            const is2025 = this.closest('.section-2025') || this.innerText.includes('2025');
            const isNewYear = new Date().getFullYear() >= 2026;

            // БЛОКИРОВКА СТАРЫХ АБОНЕМЕНТОВ
            if (isNewYear && is2025) {
                showBlockerPopup();
                return;
            }

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                paymentSection.style.display = 'block';
                const price = this.getAttribute('data-price');
                const installments = this.getAttribute('data-installments');
                const title = this.innerText;

                document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
                
                // Настройка ссылок 2026
                const instBtn = document.getElementById('installment-btn');
                if (title.includes("64")) {
                    currentInstallmentLink = LINKS_2026["12_64"];
                    if (instBtn) instBtn.style.display = 'block';
                } else if (title.includes("32")) {
                    currentInstallmentLink = LINKS_2026["6_32"];
                    if (instBtn) instBtn.style.display = 'block';
                } else {
                    currentInstallmentLink = "";
                    if (instBtn) instBtn.style.display = 'none';
                }

                if (instBtn && currentInstallmentLink) {
                    document.getElementById('months').textContent = installments + ' мес';
                }

                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    });
}

function showBlockerPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:40px; border-radius:30px; z-index:30000; text-align:center; box-shadow:0 0 100px rgba(0,0,0,0.7); width:90%; max-width:400px; border:4px solid #c0392b;";
    div.innerHTML = `
        <h3 style="color:#c0392b; margin-bottom:15px;">УПС! ПЕРИОД ИСТЕК</h3>
        <p style="margin-bottom:25px;">Абонементы 2025 года больше не доступны. Переходите к актуальным предложениям 2026 года!</p>
        <button onclick="location.href='#section-2026'; this.parentElement.remove();" style="padding:15px 25px; background:#27ae60; color:white; border:none; border-radius:50px; cursor:pointer; font-weight:bold; width:100%;">К АБОНЕМЕНТАМ 2026</button>
    `;
    document.body.appendChild(div);
}

// ======================
// 4. ПРАЗДНИЧНЫЕ ЭФФЕКТЫ
// ======================
function launchConfetti() {
    for (let i = 0; i < 100; i++) {
        const c = document.createElement('div');
        c.style.cssText = `
            position: fixed; top: -10px; left: ${Math.random() * 100}vw;
            width: ${Math.random() * 10 + 5}px; height: ${Math.random() * 10 + 5}px;
            background: ${['#f1c40f', '#e67e22', '#2ecc71', '#3498db', '#e74c3c'][Math.floor(Math.random() * 5)]};
            z-index: 25000; opacity: ${Math.random()}; border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation: fall ${Math.random() * 3 + 2}s ease-out forwards;
        `;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5000);
    }
}

function updateToNewYearMode() {
    const title = document.querySelector('.holiday-mood h2');
    if (title) title.innerHTML = "✨ С Новым 2026 Годом! ✨";
}

// ======================
// 5. ИГРА И UI
// ======================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer', pointerEvents: 'auto',
            animation: `character-fall ${7 + Math.random() * 3}s linear forwards`
        });

        if (isBonus) {
            char.onclick = (e) => {
                const wish = WISHES[Math.floor(Math.random() * WISHES.length)];
                showClickEffect(char, `🎉 +1 ${wish}`);
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                char.remove();
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            };
        }
        document.body.appendChild(char);
        setTimeout(() => char.remove(), 10000);
    }, 3000);
}

function updateUI() {
    const c = document.getElementById('character-count');
    if (c) c.textContent = caughtCharacters;
    const b = document.getElementById('current-bonus-display');
    if (b) b.textContent = currentBonus + " ₽";
    
    // Адаптация кнопки назад (удлиняем)
    const backBtn = document.querySelector('button[onclick="goBack()"]');
    if (backBtn && window.innerWidth < 768) {
        backBtn.style.padding = "12px 20px";
        backBtn.style.minWidth = "280px";
        backBtn.style.fontSize = "13px";
    }
}

// ======================
// 6. ВСПОМОГАТЕЛЬНЫЕ
// ======================
function openCardPayment() {
    window.open(LINKS_2026["card"], '_blank');
}

function openInstallment() {
    if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank');
}

function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    const timerInterval = setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) {
            if (t) t.innerHTML = "<span style='color:#FFD700; font-weight:bold;'>С НОВЫМ ГОДОМ! 🎉</span>";
            launchConfetti();
            updateToNewYearMode();
            clearInterval(timerInterval);
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (t) t.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }, 1000);
}

function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:15000; font-size:22px; pointer-events:none; transition:1.2s;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-100px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1200);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        if (!localStorage.getItem('bonusStartDate')) localStorage.setItem('bonusStartDate', Date.now());
    }
    localStorage.setItem('totalBonus', currentBonus);
    showRewardPopup();
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

function showRewardPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:30px; z-index:20000; text-align:center; box-shadow:0 0 50px rgba(0,0,0,0.5); border:6px solid #FFD700; width:85%; max-width:400px;";
    div.innerHTML = `<h2 style="color:#c0392b;">🎄 СУПЕР!</h2><div style="font-size:40px; color:#27ae60; font-weight:bold;">+${BONUS_STEP} ₽</div><p>Общая скидка: ${currentBonus} ₽</p><button onclick="this.parentElement.remove()" style="margin-top:20px; padding:12px 25px; background:#c0392b; color:white; border:none; border-radius:50px; cursor:pointer; width:100%;">ОТЛИЧНО</button>`;
    document.body.appendChild(div);
}

function initSnow() {
    const container = document.querySelector('.snow-container') || createContainer('snow-container');
    setInterval(() => {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; z-index:5; pointer-events:none; color:white; opacity:${0.4+Math.random()*0.6}; font-size:${12+Math.random()*15}px; animation:fall ${6+Math.random()*4}s linear forwards;`;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 400);
}

function initStars() {
    const container = document.querySelector('.stars-container') || createContainer('stars-container');
    container.innerHTML = '';
    if (isLightTheme) return;
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; animation:twinkle 3s infinite;`;
        container.appendChild(star);
    }
}

function createContainer(cls) { const d = document.createElement('div'); d.className = cls; document.body.prepend(d); return d; }
function goBack() { const p = document.getElementById('payment'); if (p) p.style.display = 'none'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function checkExpiration() { const s = localStorage.getItem('bonusStartDate'); if (s && (Date.now() - parseInt(s) > 90 * 24 * 60 * 60 * 1000)) { localStorage.clear(); caughtCharacters = 0; currentBonus = 0; } }
