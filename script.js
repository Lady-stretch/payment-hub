// ======================
// 1. НАСТРОЙКИ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Удачи!", "Красоты!", "Силы!", "Счастья!", "С Новым Годом!", "Энергии!"];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = "";

// База ссылок 2026
const LINKS_2026 = {
    "64": "https://ecom.otpbank.ru/smart-form?config=b0e1d97a-e60c-4559-9fd8-5666fe5f40ed",
    "32": "https://ecom.otpbank.ru/smart-form?config=293fedad-a411-411d-8b5e-0747e82f6c73",
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
    
    if (new Date().getFullYear() >= 2026) {
        launchConfetti();
        updateToNewYearMode();
    }
});

// ======================
// 3. ЛОГИКА ПРОДАЖ (Умное распределение 2025 / 2026)
// ======================
function setupShopLogic() {
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = function(e) {
            if (e.target.closest('.game-character')) return;

            const isNewYear = new Date().getFullYear() >= 2026;
            const isCard2025 = this.innerText.includes('2025');
            const isCard2026 = this.innerText.includes('2026');

            // Блокировка 2025 года после наступления 2026
            if (isNewYear && isCard2025) {
                showBlockerPopup();
                return;
            }

            const paymentSection = document.getElementById('payment');
            if (!paymentSection) return;

            paymentSection.style.display = 'block';
            const price = this.getAttribute('data-price');
            document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
            
            const instBtn = document.getElementById('installment-btn');
            const instNote = document.getElementById('installment-note') || createInstallmentNote();
            
            currentInstallmentLink = ""; // Сброс ссылки

            // --- ЛОГИКА ДЛЯ 2025 ГОДА ---
            if (isCard2025) {
                if (this.innerText.includes("16") || this.innerText.includes("32")) {
                    instBtn.style.display = 'none';
                    instNote.style.display = 'block';
                    instNote.innerHTML = "💡 Для рассрочки выберите тариф от 64 занятий";
                } else {
                    // Ссылки для 2025 года (старые)
                    const inst = this.getAttribute('data-installments');
                    if (inst === "12") currentInstallmentLink = "https://ecom.otpbank.ru/smart-form?config=42943585-8511-400a-a027-49732f1d8fb2";
                    else if (inst === "10") currentInstallmentLink = "https://ecom.otpbank.ru/smart-form?config=e0d01fc2-5884-4fb1-b769-c7955a2d3b69";
                    
                    instBtn.style.display = currentInstallmentLink ? 'block' : 'none';
                    instNote.style.display = 'none';
                    if (currentInstallmentLink) document.getElementById('months').textContent = inst + ' мес';
                }
            } 
            
            // --- ЛОГИКА ДЛЯ 2026 ГОДА ---
            else if (isCard2026) {
                if (this.innerText.includes("64")) {
                    currentInstallmentLink = LINKS_2026["64"];
                    document.getElementById('months').textContent = '12 мес';
                } else if (this.innerText.includes("32")) {
                    currentInstallmentLink = LINKS_2026["32"];
                    document.getElementById('months').textContent = '6 мес';
                }

                if (currentInstallmentLink) {
                    instBtn.style.display = 'block';
                    instNote.style.display = 'none';
                } else {
                    instBtn.style.display = 'none';
                    instNote.style.display = 'block';
                    instNote.innerHTML = "💡 Для этого тарифа рассрочка недоступна";
                }
            }

            paymentSection.scrollIntoView({ behavior: 'smooth' });
        };
    });
}

function createInstallmentNote() {
    const note = document.createElement('p');
    note.id = 'installment-note';
    note.style.cssText = "color: #e67e22; font-weight: bold; margin-top: 15px; text-align: center;";
    document.getElementById('payment').appendChild(note);
    return note;
}

// ======================
// 4. НОВЫЙ ГОД И ЭФФЕКТЫ
// ======================
function launchConfetti() {
    for (let i = 0; i < 80; i++) {
        const c = document.createElement('div');
        c.style.cssText = `position:fixed; top:-10px; left:${Math.random()*100}vw; width:10px; height:10px; background:${['#f1c40f','#e67e22','#2ecc71','#3498db','#e74c3c'][Math.floor(Math.random()*5)]}; z-index:25000; animation:fall ${Math.random()*3+2}s linear forwards;`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5000);
    }
}

function updateToNewYearMode() {
    const title = document.querySelector('.holiday-mood h2');
    if (title) title.innerHTML = "✨ С Новым 2026 Годом! ✨";
}

function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    const timerInterval = setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) {
            if (t) t.innerHTML = "<span style='color:#FFD700;'>С НОВЫМ ГОДОМ! 🎉</span>";
            launchConfetti();
            updateToNewYearMode();
            clearInterval(timerInterval);
            return;
        }
        const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        if (t) t.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }, 1000);
}

// ======================
// 5. ИГРА И UI
// ======================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄','🎅','🎁','🦌','🌟'][Math.floor(Math.random()*5)] : '❄';
        char.className = 'game-character';
        Object.assign(char.style, { position:'fixed', top:'-60px', left:(10+Math.random()*80)+'vw', fontSize:'45px', zIndex:'10000', cursor:'pointer', animation:`character-fall ${7+Math.random()*3}s linear forwards` });

        if (isBonus) {
            char.onclick = (e) => {
                showClickEffect(char, `🎉 +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
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
    const c = document.getElementById('character-count'), b = document.getElementById('current-bonus-display');
    if (c) c.textContent = caughtCharacters;
    if (b) b.textContent = currentBonus + " ₽";
    const backBtn = document.querySelector('button[onclick="goBack()"]');
    if (backBtn && window.innerWidth < 768) { backBtn.style.minWidth = "280px"; backBtn.style.padding = "15px"; }
}

function showBlockerPopup() {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:40px; border-radius:30px; z-index:30000; text-align:center; box-shadow:0 0 100px rgba(0,0,0,0.7); width:90%; max-width:400px; border:4px solid #c0392b;";
    div.innerHTML = `<h3 style="color:#c0392b;">ПЕРИОД ИСТЕК</h3><p>Абонементы 2025 года больше не доступны. Переходите к 2026 году!</p><button onclick="location.href='#section-2026'; this.parentElement.remove();" style="padding:15px; background:#27ae60; color:white; border:none; border-radius:50px; width:100%; cursor:pointer;">К АБОНЕМЕНТАМ 2026</button>`;
    document.body.appendChild(div);
}

function openCardPayment() { window.open(LINKS_2026["card"], '_blank'); }
function openInstallment() { if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank'); }
function goBack() { const p = document.getElementById('payment'); if (p) p.style.display = 'none'; window.scrollTo({top:0, behavior:'smooth'}); }
function processWin() { if (currentBonus < MAX_BONUS) { currentBonus += BONUS_STEP; if (!localStorage.getItem('bonusStartDate')) localStorage.setItem('bonusStartDate', Date.now()); } localStorage.setItem('totalBonus', currentBonus); showRewardPopup(); caughtCharacters = 0; localStorage.setItem('caughtCharacters', 0); updateUI(); }
function showRewardPopup() { const div = document.createElement('div'); div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:30px; z-index:20000; text-align:center; box-shadow:0 0 50px rgba(0,0,0,0.5); border:6px solid #FFD700; width:85%; max-width:400px;"; div.innerHTML = `<h2 style="color:#c0392b;">🎄 СУПЕР!</h2><div style="font-size:40px; color:#27ae60; font-weight:bold;">+${BONUS_STEP} ₽</div><p>Общая скидка: ${currentBonus} ₽</p><button onclick="this.parentElement.remove()" style="margin-top:20px; padding:12px 25px; background:#c0392b; color:white; border:none; border-radius:50px; width:100%;">ОТЛИЧНО</button>`; document.body.appendChild(div); }
function initSnow() { const container = document.querySelector('.snow-container') || createContainer('snow-container'); setInterval(() => { const flake = document.createElement('div'); flake.innerHTML = '❄'; flake.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; z-index:5; pointer-events:none; color:white; opacity:${0.4+Math.random()*0.6}; font-size:${12+Math.random()*15}px; animation:fall ${6+Math.random()*4}s linear forwards;`; container.appendChild(flake); setTimeout(() => flake.remove(), 10000); }, 400); }
function initStars() { const container = document.querySelector('.stars-container') || createContainer('stars-container'); container.innerHTML = ''; if (isLightTheme) return; for (let i = 0; i < 60; i++) { const star = document.createElement('div'); star.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; animation:twinkle 3s infinite;`; container.appendChild(star); } }
function createContainer(cls) { const d = document.createElement('div'); d.className = cls; document.body.prepend(d); return d; }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function checkExpiration() { const s = localStorage.getItem('bonusStartDate'); if (s && (Date.now() - parseInt(s) > 90 * 24 * 60 * 60 * 1000)) { localStorage.clear(); caughtCharacters = 0; currentBonus = 0; } }
function showClickEffect(el, text) { const rect = el.getBoundingClientRect(); const eff = document.createElement('div'); eff.innerHTML = text; eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:15000; font-size:22px; pointer-events:none; transition:1.2s;`; document.body.appendChild(eff); setTimeout(() => { eff.style.transform = 'translateY(-100px)'; eff.style.opacity = '0'; }, 20); setTimeout(() => eff.remove(), 1200); }
