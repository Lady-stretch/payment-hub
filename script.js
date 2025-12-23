// ======================
// 1. ПАМЯТЬ И КОНФИГУРАЦИЯ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Удачи!", "Красоты!", "Силы!", "Счастья!", "Побед!", "Энергии!"];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = ""; // Глобальная переменная для выбранной ссылки

// ======================
// 2. ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initStars();
    initSnow();
    initTimer();
    setupShopLogic(); 
    startCharacterGame();
    updateUI();
});

// ======================
// 3. ЛОГИКА ПАКЕТОВ (ИСПРАВЛЕННАЯ)
// ======================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Если клик по персонажу игры - игнорируем
            if (e.target.closest('.game-character')) return;

            // Визуальное выделение карточки
            document.querySelectorAll('.card').forEach(c => c.classList.remove('selected-card'));
            this.classList.add('selected-card'); 
            // Примечание: добавьте в CSS .selected-card { border: 2px solid #4a6fa5 !important; }

            const paymentSection = document.getElementById('payment');
            if (!paymentSection) return;

            paymentSection.style.display = 'block';
            
            // ЧИТАЕМ ДАННЫЕ ИЗ HTML
            const price = this.getAttribute('data-price');
            const installments = this.getAttribute('data-installments');
            
            // ОЧИСТКА ССЫЛКИ (Убираем возможные ошибки копирования)
            let rawLink = this.getAttribute('data-link') || "";
            currentInstallmentLink = rawLink.replace(/&quot;/g, '').replace(/"/g, '').trim();

            // Обновляем текст цены
            const priceDisplay = document.getElementById('selected-price');
            if (priceDisplay) priceDisplay.textContent = Number(price).toLocaleString('ru-RU');
            
            const instBtn = document.getElementById('installment-btn');
            const instNote = document.getElementById('installment-note') || createInstallmentNote();
            const monthsDisplay = document.getElementById('months');

            // ЛОГИКА ОТОБРАЖЕНИЯ КНОПКИ РАССРОЧКИ
            if (installments && installments !== 'Нет' && currentInstallmentLink !== "") {
                if (instBtn) instBtn.style.display = 'block';
                if (monthsDisplay) monthsDisplay.textContent = installments + ' мес';
                instNote.style.display = 'none';
            } else {
                if (instBtn) instBtn.style.display = 'none';
                
                // Если это 16 или 32 занятия (где рассрочки нет)
                const title = this.innerText;
                if (title.includes("16") || title.includes("32")) {
                    instNote.style.display = 'block';
                    instNote.innerHTML = "💡 Рассрочка доступна для тарифов от 64 занятий";
                } else {
                    instNote.style.display = 'none';
                }
            }

            paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ЭТА ФУНКЦИЯ ОТКРЫВАЕТ БАНК
function openInstallment() {
    if (currentInstallmentLink && currentInstallmentLink !== "") {
        console.log("Переход по ссылке:", currentInstallmentLink);
        window.open(currentInstallmentLink, '_blank');
    } else {
        alert("Для данного тарифа ссылка не настроена.");
    }
}

function goBack() {
    const p = document.getElementById('payment');
    if (p) p.style.display = 'none';
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected-card'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// 4. ИГРА И ЭФФЕКТЫ
// ======================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer',
            animation: `character-fall ${7 + Math.random() * 3}s linear forwards`
        });

        if (isBonus) {
            const catchFn = (e) => {
                e.preventDefault(); e.stopPropagation();
                showClickEffect(char, `🎉 +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                char.remove();
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            };
            char.onclick = catchFn;
            char.ontouchstart = catchFn;
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
}

function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `position: fixed; left: ${rect.left}px; top: ${rect.top}px; color: #FFD700; font-weight: bold; z-index: 15000; font-size: 20px; pointer-events: none; transition: 1.2s; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-100px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1200);
}

function processWin() {
    if (currentBonus < MAX_BONUS) { currentBonus += BONUS_STEP; }
    localStorage.setItem('totalBonus', currentBonus);
    alert(`Поздравляем! Ваша праздничная скидка увеличена до ${currentBonus} ₽`);
    caughtCharacters = 0; localStorage.setItem('caughtCharacters', 0); updateUI();
}

// Служебные
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function createInstallmentNote() {
    const note = document.createElement('p');
    note.id = 'installment-note';
    note.style.cssText = "color: #e67e22; font-weight: bold; margin-top: 15px; text-align: center;";
    const payBlock = document.getElementById('payment');
    if (payBlock) payBlock.appendChild(note);
    return note;
}
function initSnow() { const container = document.querySelector('.snow-container'); if (!container) return; setInterval(() => { const f = document.createElement('div'); f.innerHTML = '❄'; f.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${Math.random()}; animation:fall 8s linear forwards; color:white; pointer-events:none; z-index:5;`; container.appendChild(f); setTimeout(()=>f.remove(),8000); }, 400); }
function initStars() { const container = document.querySelector('.stars-container'); if (!container || isLightTheme) return; container.innerHTML = ''; for (let i=0; i<50; i++) { const s = document.createElement('div'); s.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()};`; container.appendChild(s); } }
function initTimer() {
    const t = document.getElementById('countdown-timer');
    if (!t) return;
    const target = new Date('January 1, 2026 00:00:00').getTime();
    setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) { t.textContent = "С НОВЫМ ГОДОМ! 🎉"; return; }
        const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        t.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }, 1000);
}
