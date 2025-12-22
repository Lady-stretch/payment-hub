// ======================
// 1. КОНФИГУРАЦИЯ И ПАМЯТЬ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;

// Список праздничных пожеланий
const WISHES = [
    "Удачи!", "Красоты!", "Силы!", "Счастья!", 
    "Здоровья!", "Успеха!", "Драйва!", "Энергии!",
    "Побед!", "Радости!", "Спорта!", "Гибкости!"
];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = "";

// Ссылки ОТП Банка (только для больших тарифов)
const INSTALLMENT_LINKS = {
    "12": "https://ecom.otpbank.ru/smart-form?config=42943585-8511-400a-a027-49732f1d8fb2", // 96 зан
    "10": "https://ecom.otpbank.ru/smart-form?config=e0d01fc2-5884-4fb1-b769-c7955a2d3b69"  // 64 зан
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
    updateUI(); // Подтягиваем данные из памяти сразу
});

// ======================
// 3. МАГАЗИН И ЛОГИКА ТАРИФОВ
// ======================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.onclick = toggleTheme;
    }

    document.querySelectorAll('.card').forEach(card => {
        card.onclick = function(e) {
            if (e.target.closest('.game-character')) return;

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                paymentSection.style.display = 'block';
                const price = this.getAttribute('data-price');
                const installments = this.getAttribute('data-installments');
                const title = this.innerText; // Название тарифа

                document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
                
                const instBtn = document.getElementById('installment-btn');
                const instNote = document.getElementById('installment-note') || createInstallmentNote();

                // ЛОГИКА ОГРАНИЧЕНИЯ РАССРОЧКИ (16 и 32 занятия)
                if (title.includes("16") || title.includes("32")) {
                    if (instBtn) instBtn.style.display = 'none';
                    instNote.style.display = 'block';
                    instNote.innerHTML = "💡 Для рассрочки выберите тариф от 64 занятий";
                } else if (installments && installments !== 'Нет') {
                    currentInstallmentLink = INSTALLMENT_LINKS[installments] || "";
                    if (instBtn) {
                        document.getElementById('months').textContent = installments + ' мес';
                        instBtn.style.display = 'block';
                    }
                    instNote.style.display = 'none';
                } else {
                    if (instBtn) instBtn.style.display = 'none';
                    instNote.style.display = 'none';
                }

                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    });
}

function createInstallmentNote() {
    const note = document.createElement('p');
    note.id = 'installment-note';
    note.style.cssText = "color: #e67e22; font-weight: bold; margin-top: 15px; text-align: center;";
    const container = document.getElementById('payment');
    if (container) container.appendChild(note);
    return note;
}

// ======================
// 4. ИГРОВАЯ МЕХАНИКА
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
            const catchFn = (e) => {
                e.preventDefault(); e.stopPropagation();
                
                // Эффект пожелания
                const randomWish = WISHES[Math.floor(Math.random() * WISHES.length)];
                showClickEffect(char, `🎉 +1 ${randomWish}`);
                
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                
                char.remove();
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            };
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
    showRewardPopup();
    
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', caughtCharacters);
    updateUI();
}

// ======================
// 5. ИНТЕРФЕЙС И ЭФФЕКТЫ
// ======================
function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `
        position: fixed; left: ${rect.left}px; top: ${rect.top}px;
        color: #FFD700; font-weight: bold; z-index: 15000;
        font-size: 22px; pointer-events: none; white-space: nowrap;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transition: 1.2s;
    `;
    document.body.appendChild(eff);
    setTimeout(() => {
        eff.style.transform = 'translateY(-100px) scale(1.2)';
        eff.style.opacity = '0';
    }, 20);
    setTimeout(() => eff.remove(), 1200);
}

function showRewardPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, #fff, #f9f9f9); padding:40px; border-radius:30px; z-index:20000; text-align:center; box-shadow:0 0 60px rgba(0,0,0,0.6); border:6px solid #FFD700; color:#222; width:90%; max-width:450px;";
    div.innerHTML = `
        <h2 style="color:#c0392b; font-size: 28px; margin-bottom:15px;">🎄 ПОЗДРАВЛЯЕМ!</h2>
        <p style="font-size: 18px;">Вы собрали коллекцию!</p>
        <div style="font-size: 48px; font-weight: 900; color: #27ae60; margin: 20px 0;">+${BONUS_STEP} ₽</div>
        <p style="margin-bottom: 25px;">Ваша общая скидка теперь: <strong>${currentBonus} ₽</strong></p>
        <button id="close-reward" style="padding:15px 30px; background: #c0392b; color:white; border:none; border-radius:50px; cursor:pointer; font-weight:bold; font-size: 18px; box-shadow: 0 4px 15px rgba(192,57,43,0.4);">ИГРАТЬ ДАЛЬШЕ</button>
    `;
    document.body.appendChild(div);
    document.getElementById('close-reward').onclick = () => div.remove();
}

function updateUI() {
    const c = document.getElementById('character-count');
    if (c) c.textContent = caughtCharacters;
    const b = document.getElementById('current-bonus-display');
    if (b) b.textContent = currentBonus + " ₽";
}

// ======================
// 6. СЛУЖЕБНЫЕ (ТЕМЫ, СНЕГ, ВРЕМЯ)
// ======================
function toggleTheme() {
    isLightTheme = !isLightTheme;
    applyTheme();
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    initStars();
}

function applyTheme() {
    document.body.classList.toggle('light-theme', isLightTheme);
}

function initStars() {
    const container = document.querySelector('.stars-container') || createContainer('stars-container');
    container.innerHTML = '';
    if (isLightTheme) return;
    for (let i = 0; i < 70; i++) {
        const star = document.createElement('div');
        star.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; animation:twinkle 3s infinite;`;
        container.appendChild(star);
    }
}

function initSnow() {
    const container = document.querySelector('.snow-container') || createContainer('snow-container');
    setInterval(() => {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; z-index:5; pointer-events:none; color:white; opacity:${0.4+Math.random()*0.6}; font-size:${12+Math.random()*12}px; animation:fall ${6+Math.random()*4}s linear forwards;`;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 400);
}

function createContainer(cls) {
    const d = document.createElement('div');
    d.className = cls;
    document.body.prepend(d);
    return d;
}

function checkExpiration() {
    const s = localStorage.getItem('bonusStartDate');
    if (s && (Date.now() - parseInt(s) > 90 * 24 * 60 * 60 * 1000)) {
        localStorage.clear();
        caughtCharacters = 0;
        currentBonus = 0;
    }
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

function openInstallment() {
    if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank');
}

function goBack() {
    const payment = document.getElementById('payment');
    if (payment) payment.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
