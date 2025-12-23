// ======================
// 1. КОНФИГУРАЦИЯ И ПАМЯТЬ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;

const WISHES = [
    "Удачи!", "Красоты!", "Силы!", "Счастья!", 
    "Здоровья!", "Успеха!", "Драйва!", "Энергии!",
    "Побед!", "Радости!", "Спорта!", "Гибкости!"
];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = "";

// Все ссылки (2025 и 2026)
const ALL_LINKS = {
    "2025_96": "https://ecom.otpbank.ru/smart-form?config=42943585-8511-400a-a027-49732f1d8fb2",
    "2025_64": "https://ecom.otpbank.ru/smart-form?config=e0d01fc2-5884-4fb1-b769-c7955a2d3b69",
    "2026_64": "https://ecom.otpbank.ru/smart-form?config=b0e1d97a-e60c-4559-9fd8-5666fe5f40ed",
    "2026_32": "https://ecom.otpbank.ru/smart-form?config=293fedad-a411-411d-8b5e-0747e82f6c73",
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
    
    // Эффект конфетти, если уже 2026 год
    if (new Date().getFullYear() >= 2026) launchConfetti();
});

// ======================
// 3. МАГАЗИН И ЛОГИКА ТАРИФОВ
// ======================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    document.querySelectorAll('.card').forEach(card => {
        card.onclick = function(e) {
            if (e.target.closest('.game-character')) return;

            const title = this.innerText;
            const is2025 = title.includes('2025');
            const is2026 = title.includes('2026');
            const isNewYear = new Date().getFullYear() >= 2026;

            // Блокировка 2025 года после НГ
            if (isNewYear && is2025) {
                showBlockerPopup();
                return;
            }

            const paymentSection = document.getElementById('payment');
            if (paymentSection) {
                paymentSection.style.display = 'block';
                const price = this.getAttribute('data-price');
                document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
                
                const instBtn = document.getElementById('installment-btn');
                const instNote = document.getElementById('installment-note') || createInstallmentNote();
                currentInstallmentLink = "";

                // ЛОГИКА ССЫЛОК (Ваша вчерашняя база + новые)
                if (is2025) {
                    if (title.includes("96")) currentInstallmentLink = ALL_LINKS["2025_96"];
                    else if (title.includes("64")) currentInstallmentLink = ALL_LINKS["2025_64"];
                    
                    if (!currentInstallmentLink && (title.includes("16") || title.includes("32"))) {
                        instBtn.style.display = 'none';
                        instNote.style.display = 'block';
                        instNote.innerHTML = "💡 Для рассрочки выберите тариф от 64 занятий";
                    }
                } else if (is2026) {
                    if (title.includes("64")) currentInstallmentLink = ALL_LINKS["2026_64"];
                    else if (title.includes("32")) currentInstallmentLink = ALL_LINKS["2026_32"];
                    
                    if (!currentInstallmentLink) {
                        instBtn.style.display = 'none';
                        instNote.style.display = 'block';
                        instNote.innerHTML = "💡 Для этого тарифа рассрочка недоступна";
                    }
                }

                if (currentInstallmentLink) {
                    instBtn.style.display = 'block';
                    instNote.style.display = 'none';
                    const months = title.includes("32") ? "6 мес" : (title.includes("64") && is2025 ? "10 мес" : "12 мес");
                    document.getElementById('months').textContent = months;
                }

                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
    });
}

// ======================
// 4. ИГРОВАЯ МЕХАНИКА (ИСПРАВЛЕННАЯ)
// ======================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        // Возвращаем персонажей
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

// ======================
// 5. ИНТЕРФЕЙС И ПОП-АПЫ
// ======================
function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `position: fixed; left: ${rect.left}px; top: ${rect.top}px; color: #FFD700; font-weight: bold; z-index: 15000; font-size: 22px; pointer-events: none; white-space: nowrap; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transition: 1.2s;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-100px) scale(1.2)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1200);
}

function showRewardPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background: white; padding:40px; border-radius:30px; z-index:20000; text-align:center; box-shadow:0 0 60px rgba(0,0,0,0.6); border:6px solid #FFD700; color:#222; width:90%; max-width:450px;";
    div.innerHTML = `
        <h2 style="color:#c0392b; font-size: 28px; margin-bottom:15px;">🎄 ПОЗДРАВЛЯЕМ!</h2>
        <p style="font-size: 18px;">Вы собрали коллекцию!</p>
        <div style="font-size: 48px; font-weight: 900; color: #27ae60; margin: 20px 0;">+${BONUS_STEP} ₽</div>
        <p style="margin-bottom: 25px;">Ваша общая скидка теперь: <strong>${currentBonus} ₽</strong></p>
        <button onclick="this.parentElement.remove()" style="padding:15px 30px; background: #c0392b; color:white; border:none; border-radius:50px; cursor:pointer; font-weight:bold; width:100%;">ИГРАТЬ ДАЛЬШЕ</button>
    `;
    document.body.appendChild(div);
}

function showBlockerPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:40px; border-radius:30px; z-index:30000; text-align:center; box-shadow:0 0 100px rgba(0,0,0,0.7); width:90%; max-width:400px; border:4px solid #c0392b;";
    div.innerHTML = `<h3 style="color:#c0392b;">ПЕРИОД ИСТЕК</h3><p>Абонементы 2025 года больше не доступны. Переходите к 2026 году!</p><button onclick="location.href='#section-2026'; this.parentElement.remove();" style="padding:15px; background:#27ae60; color:white; border:none; border-radius:50px; width:100%; cursor:pointer; font-weight:bold; margin-top:15px;">К АБОНЕМЕНТАМ 2026</button>`;
    document.body.appendChild(div);
}

// ======================
// 6. СЛУЖЕБНЫЕ ФУНКЦИИ
// ======================
function updateUI() {
    const c = document.getElementById('character-count');
    if (c) c.textContent = caughtCharacters;
    const b = document.getElementById('current-bonus-display');
    if (b) b.textContent = currentBonus + " ₽";
    
    // Адаптация кнопки возврата
    const backBtn = document.querySelector('button[onclick="goBack()"]');
    if (backBtn && window.innerWidth < 768) {
        backBtn.style.minWidth = "280px";
        backBtn.style.padding = "15px";
    }
}

function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) {
            if (t) t.innerHTML = "<span style='color:#FFD700;'>С НОВЫМ ГОДОМ! 🎉</span>";
            const h2 = document.querySelector('.holiday-mood h2');
            if (h2) h2.innerText = "С Новым Годом!";
            return;
        }
        const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        if (t) t.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }, 1000);
}

function launchConfetti() {
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:fixed; top:-10px; left:${Math.random()*100}vw; width:8px; height:8px; background:gold; z-index:25000; animation:fall 3s linear forwards;`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3000);
    }
}

function createInstallmentNote() {
    const note = document.createElement('p');
    note.id = 'installment-note';
    note.style.cssText = "color: #e67e22; font-weight: bold; margin-top: 15px; text-align: center;";
    document.getElementById('payment').appendChild(note);
    return note;
}

function processWin() {
    if (currentBonus < MAX_BONUS) { currentBonus += BONUS_STEP; if (!localStorage.getItem('bonusStartDate')) localStorage.setItem('bonusStartDate', Date.now()); }
    localStorage.setItem('totalBonus', currentBonus);
    showRewardPopup();
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

function openCardPayment() { window.open(ALL_LINKS["card"], '_blank'); }
function openInstallment() { if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank'); }
function goBack() { document.getElementById('payment').style.display = 'none'; window.scrollTo({top:0, behavior:'smooth'}); }
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function checkExpiration() { const s = localStorage.getItem('bonusStartDate'); if (s && (Date.now() - parseInt(s) > 90*24*60*60*1000)) { localStorage.clear(); caughtCharacters = 0; currentBonus = 0; } }
function initSnow() { const container = document.querySelector('.snow-container') || createContainer('snow-container'); setInterval(() => { const f = document.createElement('div'); f.innerHTML = '❄'; f.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${0.5+Math.random()*0.5}; animation:fall 8s linear forwards; color:white; pointer-events:none;`; container.appendChild(f); setTimeout(()=>f.remove(),8000); }, 400); }
function initStars() { const container = document.querySelector('.stars-container') || createContainer('stars-container'); container.innerHTML = ''; if (isLightTheme) return; for (let i=0; i<50; i++) { const s = document.createElement('div'); s.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()};`; container.appendChild(s); } }
function createContainer(cls) { const d = document.createElement('div'); d.className = cls; document.body.prepend(d); return d; }
