// ==========================================
// 1. КОНСТАНТЫ И СОСТОЯНИЕ
// ==========================================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Грации!", "Красоты!", "Здоровья!", "Счастья!", "Энергии!", "Гибкости!", "Любви!", "Шпагата!"];

const SALE_LINKS = {
    card: "https://checkout.tochka.com/c86b3625-580b-46a8-93ff-88394a302610",
    installment96: "https://ecom.otpbank.ru/smart-form?config=4ba599c9-4baa-40c1-8573-6b6945cdb73e",
    installment64: "https://ecom.otpbank.ru/smart-form?config=c915eef7-212b-4548-9c12-06d8757135d6"
};

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = ""; 

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initStars();
    initSnow();
    initTimer();
    setupShopLogic(); 
    startCharacterGame();
    updateUI();
});

// ==========================================
// 3. ВИЗУАЛЬНЫЕ ЭФФЕКТЫ (ЗВЕЗДЫ И СНЕГ)
// ==========================================
function initStars() { 
    const container = document.querySelector('.stars-container'); 
    if (!container) return;
    container.innerHTML = ''; 
    if (isLightTheme) return;

    for (let i = 0; i < 150; i++) { 
        const s = document.createElement('div'); 
        const size = Math.random() * 3 + 'px';
        const duration = 2 + Math.random() * 4 + 's';
        const delay = Math.random() * 5 + 's';
        
        s.className = 'star';
        s.style.cssText = `
            position: absolute; width: ${size}; height: ${size}; background: white; 
            left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
            opacity: ${Math.random()}; border-radius: 50%; pointer-events: none;
            animation: twinkle ${duration} infinite ease-in-out ${delay};
        `; 
        container.appendChild(s); 
    } 
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    if (!container) return;
    
    setInterval(() => {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        const size = 10 + Math.random() * 20 + 'px';
        const duration = 5 + Math.random() * 8 + 's';
        const drift = (Math.random() - 0.5) * 200 + 'px';

        flake.style.cssText = `
            position: fixed; top: -20px; left: ${Math.random() * 100}vw;
            opacity: ${Math.random()}; font-size: ${size};
            color: white; pointer-events: none; z-index: 5;
            transition: transform ${duration}s linear;
            animation: snow-fall ${duration}s linear forwards;
        `;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 400);
}

// ==========================================
// 4. ТАЙМЕР
// ==========================================
function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    
    setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) { t.textContent = "С НОВЫМ ГОДОМ! 🎉"; return; }
        
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        
        const p = (n) => n < 10 ? '0'+n : n;
        t.textContent = `${p(d)}д : ${p(h)}ч : ${p(m)}м : ${p(s)}с`;
    }, 1000);
}

// ==========================================
// 5. ИГРОВАЯ ЛОГИКА
// ==========================================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.35;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        const startLeft = (10 + Math.random() * 80) + 'vw';
        const duration = 6 + Math.random() * 4;

        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: startLeft,
            fontSize: '45px', zIndex: '10000', cursor: 'pointer', userSelect: 'none',
            animation: `fall ${duration}s linear forwards`
        });

        const catchFn = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (isBonus) {
                showClickEffect(char, `✨ +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            }
            char.remove();
        };

        char.onclick = catchFn;
        char.ontouchstart = catchFn;
        document.body.appendChild(char);
        setTimeout(() => char.remove(), 10000);
    }, 2500);
}

function showClickEffect(el, txt) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = txt;
    eff.style.cssText = `
        position: fixed; left: ${rect.left}px; top: ${rect.top}px;
        color: #FFD700; font-weight: 900; z-index: 15000; font-size: 22px;
        text-shadow: 0 0 10px rgba(0,0,0,0.5); pointer-events: none; transition: 1.5s;
    `;
    document.body.appendChild(eff);
    setTimeout(() => {
        eff.style.transform = 'translateY(-120px) scale(1.3)';
        eff.style.opacity = '0';
    }, 50);
    setTimeout(() => eff.remove(), 1500);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }

    const end = Date.now() + 3000;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#2ecc71', '#ffffff', '#e74c3c'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#2ecc71', '#ffffff', '#e74c3c'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    const modal = document.getElementById('win-modal');
    const winText = document.getElementById('win-text');
    winText.innerHTML = currentBonus >= MAX_BONUS ? 
        `МАКСИМАЛЬНЫЙ БОНУС!<br><br><strong>Скидка 1000₽ АКТИВИРОВАНА</strong>` : 
        `Вам начислено <strong>200₽</strong>!<br>Текущий бонус: <strong>${currentBonus}₽</strong>`;
    
    modal.style.display = 'flex';
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

// ==========================================
// 6. ОПЛАТА И НАВИГАЦИЯ
// ==========================================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.game-character')) return;
            document.querySelectorAll('.card').forEach(c => c.style.border = "none");
            this.style.border = "3px solid var(--green)";

            const paySec = document.getElementById('payment');
            paySec.style.display = 'block';
            
            const price = this.getAttribute('data-price');
            const inst = this.getAttribute('data-installments');
            const hasMax = currentBonus >= MAX_BONUS;
            const title = this.querySelector('h3').innerText;

            let finalLink = this.getAttribute('data-link') || "";
            if (hasMax) {
                if (title.includes("96")) finalLink = SALE_LINKS.installment96;
                else if (title.includes("64")) finalLink = SALE_LINKS.installment64;
                document.getElementById('sbp-link').href = SALE_LINKS.card;
            } else {
                document.getElementById('sbp-link').href = "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E";
            }
            currentInstallmentLink = finalLink;

            const dispPrice = hasMax ? (Number(price) - 1000) : Number(price);
            document.getElementById('selected-price').textContent = dispPrice.toLocaleString('ru-RU');

            const instBtn = document.getElementById('installment-btn');
            if (inst !== 'Нет' && currentInstallmentLink) {
                instBtn.style.display = 'block';
                document.getElementById('months').textContent = inst + ' мес';
            } else {
                instBtn.style.display = 'none';
            }
            paySec.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function closeWinModal() { document.getElementById('win-modal').style.display = 'none'; }
function goBack() { 
    document.getElementById('payment').style.display = 'none'; 
    window.scrollTo({ top: document.getElementById('packages').offsetTop - 100, behavior: 'smooth' });
}
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function updateUI() { const el = document.getElementById('character-count'); if(el) el.textContent = caughtCharacters; }

// ==========================================
// 7. СТИЛИ АНИМАЦИЙ
// ==========================================
const styleTag = document.createElement('style');
styleTag.innerHTML = `
    @keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }
    @keyframes
