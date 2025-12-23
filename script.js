// ======================
// 1. НАСТРОЙКИ И ПАМЯТЬ
// ======================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Удачи!", "Красоты!", "Силы!", "Счастья!", "Энергии!", "Успеха!"];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallment = ""; // Сюда будет попадать ссылка из data-link

// ======================
// 2. ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    checkExpiration();
    applyTheme();
    initStars();
    initSnow();
    initTimer();
    setupShopLogic(); // Запуск логики пакетов
    startCharacterGame();
    updateUI();
});

// ======================
// 3. ЛОГИКА ПАКЕТОВ (Универсальная)
// ======================
function setupShopLogic() {
    // Кнопка темы
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    // Клик по карточкам
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Если кликнули по падающему персонажу внутри карточки — не открываем оплату
            if (e.target.closest('.game-character')) return;

            // Визуальное выделение
            document.querySelectorAll('.card').forEach(c => {
                c.style.borderColor = '';
                c.style.borderWidth = '';
                c.style.borderStyle = '';
            });
            this.style.borderColor = '#4a6fa5';
            this.style.borderWidth = '2px';
            this.style.borderStyle = 'solid';

            const paymentSection = document.getElementById('payment');
            if (!paymentSection) return; // Если на странице нет блока оплаты (как в future-packages)

            paymentSection.style.display = 'block';
            
            // Берём данные прямо из HTML-атрибутов нажатой карточки
            const price = this.getAttribute('data-price');
            const installments = this.getAttribute('data-installments');
            const link = this.getAttribute('data-link');

            // Обновляем цену в блоке оплаты
            document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
            
            const installmentBtn = document.getElementById('installment-btn');
            
            // Проверка: есть ли рассрочка для этой конкретной карточки
            if (installments && installments !== 'Нет' && link) {
                currentInstallment = link; // Запоминаем ссылку из data-link
                document.getElementById('months').textContent = installments + ' мес';
                installmentBtn.style.display = 'block';
            } else {
                currentInstallment = "";
                installmentBtn.style.display = 'none';
            }

            paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function openInstallment() {
    if (currentInstallment) {
        window.open(currentInstallment, '_blank');
    }
}

function goBack() {
    const paymentSection = document.getElementById('payment');
    if (paymentSection) paymentSection.style.display = 'none';
    
    document.querySelectorAll('.card').forEach(card => {
        card.style.borderColor = '';
        card.style.borderWidth = '';
        card.style.borderStyle = '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// 4. ИГРА И ЭФФЕКТЫ (Ваша стабильная версия)
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
            char.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
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
    const c = document.getElementById('character-count');
    if (c) c.textContent = caughtCharacters;
    const b = document.getElementById('current-bonus-display');
    if (b) b.textContent = currentBonus + " ₽";
}

// Вспомогательные функции (тема, снег, таймер и т.д.)
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
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
    if (currentBonus < MAX_BONUS) { currentBonus += BONUS_STEP; if (!localStorage.getItem('bonusStartDate')) localStorage.setItem('bonusStartDate', Date.now()); }
    localStorage.setItem('totalBonus', currentBonus);
    alert(`Поздравляем! Вы получили бонус ${BONUS_STEP} ₽. Ваша скидка: ${currentBonus} ₽`);
    caughtCharacters = 0; localStorage.setItem('caughtCharacters', 0); updateUI();
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
function checkExpiration() { const s = localStorage.getItem('bonusStartDate'); if (s && (Date.now() - parseInt(s) > 90*24*60*60*1000)) { localStorage.clear(); caughtCharacters = 0; currentBonus = 0; } }
