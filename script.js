// ======================
// НАСТРОЙКИ И СОСТОЯНИЕ
// ======================
let caughtCharacters = 0;
const CHARACTERS_FOR_REWARD = 10;
let isLightTheme = false;
let characterInterval;
let isGameActive = true;

const CLICKABLE = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const DECOR = ['❄', '✨', '🧊'];

// ======================
// ЗАПУСК ПРИ ЗАГРУЗКЕ
// ======================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🎄 Скрипт запущен");
    loadSettings();
    
    // Запуск всех систем
    initStars();
    initDecorativeSnow();
    initTimer();
    setupMenuLogic();
    
    // Запуск игры
    startCharacterGame();
    updateUI();
});

// ======================
// 1. ЗВЕЗДНОЕ НЕБО
// ======================
function initStars() {
    const container = document.querySelector('.stars-container') || createFallbackContainer('stars-container');
    if (isLightTheme) return;

    container.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: 2px; height: 2px;
            background: white;
            border-radius: 50%;
            opacity: ${Math.random()};
            animation: twinkle ${Math.random() * 3 + 2}s infinite;
        `;
        container.appendChild(star);
    }
}

// ======================
// 2. ДЕКОРАТИВНЫЙ СНЕГ
// ======================
function initDecorativeSnow() {
    const container = document.querySelector('.snow-container') || createFallbackContainer('snow-container');
    
    setInterval(() => {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * 100}vw;
            color: ${isLightTheme ? '#a2c4d9' : 'white'};
            opacity: ${Math.random() * 0.7 + 0.3};
            font-size: ${Math.random() * 10 + 10}px;
            z-index: 5;
            pointer-events: none;
            animation: fall ${Math.random() * 5 + 5}s linear forwards;
        `;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 400);
}

// ======================
// 3. ИГРА (ПЕРСОНАЖИ)
// ======================
function startCharacterGame() {
    if (characterInterval) clearInterval(characterInterval);
    characterInterval = setInterval(() => {
        if (!isGameActive) return;

        const isBonus = Math.random() > 0.6; // 40% шанс на игрового персонажа
        const emoji = isBonus ? CLICKABLE[Math.floor(Math.random() * CLICKABLE.length)] : DECOR[Math.floor(Math.random() * DECOR.length)];
        
        const char = document.createElement('div');
        char.innerHTML = emoji;
        char.className = 'game-character';
        
        // Стилизация для гарантии видимости
        Object.assign(char.style, {
            position: 'fixed',
            top: '-50px',
            left: (Math.random() * 80 + 10) + 'vw',
            fontSize: '40px',
            zIndex: '99999',
            cursor: 'pointer',
            userSelect: 'none',
            animation: `character-fall ${Math.random() * 3 + 7}s linear forwards`
        });

        if (isBonus) {
            char.onclick = () => {
                caughtCharacters++;
                showEffect(char, "🎉 +1");
                char.remove();
                updateUI();
                if (caughtCharacters >= CHARACTERS_FOR_REWARD) {
                    giveReward();
                }
            };
        }

        document.body.appendChild(char);
        setTimeout(() => char.remove(), 10000);
    }, 3000);
}

function updateUI() {
    const counter = document.getElementById('character-count');
    if (counter) counter.textContent = caughtCharacters;
}

function giveReward() {
    // Показываем окно
    const winBox = document.createElement('div');
    winBox.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:20px; z-index:100000; text-align:center; box-shadow:0 0 50px rgba(0,0,0,0.5); border:5px solid #FFD700; color: #222;";
    winBox.innerHTML = `
        <h2 style="color:#e67e22">🎁 ПОДАРОК ВАШ!</h2>
        <p>Скидка 500 ₽ на абонемент получена!</p>
        <button id="close-reward" style="padding:10px 20px; background:#27ae60; color:white; border:none; border-radius:10px; cursor:pointer;">ИГРАТЬ СНОВА</button>
    `;
    document.body.appendChild(winBox);

    document.getElementById('close-reward').onclick = () => {
        winBox.remove();
        caughtCharacters = 0; // СБРОС ДЛЯ ПОВТОРНОЙ ИГРЫ
        updateUI();
    };
}

// ======================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================
function showEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.textContent = text;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:100000; transition: 1s;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-50px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1000);
}

function initTimer() {
    const timerEl = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (!timerEl) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerEl.textContent = `${d}д ${h}ч ${m}м ${s}с`;
    }, 1000);
}

function setupMenuLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = () => {
        isLightTheme = !isLightTheme;
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        initStars();
    };
}

function loadSettings() {
    if (localStorage.getItem('theme') === 'light') {
        isLightTheme = true;
        document.body.classList.add('light-theme');
    }
}

function createFallbackContainer(className) {
    const div = document.createElement('div');
    div.className = className;
    document.body.prepend(div);
    return div;
}

function showEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.textContent = text;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:bold; z-index:100000; transition: 1s; font-size: 20px;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-50px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1000);
}
