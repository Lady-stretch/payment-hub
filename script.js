// ==========================================
// 1. КОНФИГУРАЦИЯ И СОСТОЯНИЕ
// ==========================================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Грации!", "Красоты!", "Здоровья!", "Счастья!", "Энергии!", "Гибкости!"];

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
// 3. ЛОГИКА МАГАЗИНА И ОПЛАТЫ
// ==========================================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.game-character')) return;

            // Выделение карточки
            document.querySelectorAll('.card').forEach(c => {
                c.style.border = "none";
                c.classList.remove('selected-card');
            });
            this.classList.add('selected-card');
            this.style.border = "3px solid var(--green)";

            const paymentSection = document.getElementById('payment');
            paymentSection.style.display = 'block';
            
            const price = this.getAttribute('data-price');
            const installments = this.getAttribute('data-installments');
            const hasMaxBonus = currentBonus >= MAX_BONUS;
            const title = this.querySelector('h3').innerText;

            // Установка ссылок
            let finalLink = this.getAttribute('data-link') || "";
            if (hasMaxBonus) {
                if (title.includes("96")) finalLink = SALE_LINKS.installment96;
                else if (title.includes("64")) finalLink = SALE_LINKS.installment64;
                document.getElementById('sbp-link').href = SALE_LINKS.card;
            } else {
                document.getElementById('sbp-link').href = "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E";
            }
            currentInstallmentLink = finalLink;

            // Форматирование цены (с пробелом перед ₽)
            const displayPrice = hasMaxBonus ? (Number(price) - 1000) : Number(price);
            document.getElementById('selected-price').textContent = displayPrice.toLocaleString('ru-RU');

            // Кнопка рассрочки
            const instBtn = document.getElementById('installment-btn');
            if (installments && installments !== 'Нет' && currentInstallmentLink) {
                instBtn.style.display = 'block';
                document.getElementById('months').textContent = installments + ' мес';
            } else {
                instBtn.style.display = 'none';
            }

            paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function openInstallment() {
    if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank');
}

function goBack() {
    document.getElementById('payment').style.display = 'none';
    document.querySelectorAll('.card').forEach(c => {
        c.style.border = "none";
        c.classList.remove('selected-card');
    });
    window.scrollTo({ top: document.getElementById('packages').offsetTop - 100, behavior: 'smooth' });
}

// ==========================================
// 4. ТАЙМЕР И ТЕМА
// ==========================================
function initTimer() {
    const t = document.getElementById('countdown-timer');
    if (!t) return;
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

function applyTheme() {
    document.body.classList.toggle('light-theme', isLightTheme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = isLightTheme ? '☀️' : '🌙';
}

function toggleTheme() {
    isLightTheme = !isLightTheme;
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    applyTheme();
    initStars();
}

// ==========================================
// 5. ИГРА И ЭФФЕКТЫ (СНЕГ, ЗВЕЗДЫ, ГЕРОИ)
// ==========================================
function initStars() { 
    const container = document.querySelector('.stars-container'); 
    if (!container) return; 
    container.innerHTML = ''; 
    if (isLightTheme) return;
    for (let i=0; i<150; i++) { 
        const s = document.createElement('div'); 
        const size = Math.random() * 3 + 'px';
        s.style.cssText = `position:absolute; width:${size}; height:${size}; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; border-radius:50%; pointer-events:none;`; 
        container.appendChild(s); 
    } 
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    if (!container) return;
    setInterval(() => {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: fixed; top: -20px; left: ${Math.random() * 100}vw;
            opacity: ${Math.random()}; font-size: ${10 + Math.random() * 20}px;
            color: white; pointer-events: none; z-index: 5;
            animation: fall ${5 + Math.random() * 10}s linear forwards;
        `;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 10000);
    }, 300);
}

function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer', userSelect: 'none',
            animation: `fall ${6 + Math.random() * 4}s linear forwards`
        });

        const catchFn = (e) => {
            e.preventDefault();
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

function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `
        position: fixed; left: ${rect.left}px; top: ${rect.top}px;
        color: #FFD700; font-weight: 900; z-index: 15000; font-size: 22px;
        pointer-events: none; transition: 1.5s; text-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(eff);
    setTimeout(() => {
        eff.style.transform = 'translateY(-120px) scale(1.2)';
        eff.style.opacity = '0';
    }, 50);
    setTimeout(() => eff.remove(), 1500);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }
    alert(currentBonus >= MAX_BONUS ? "ПОЗДРАВЛЯЕМ! Скидка 1000₽ на абонемент ваша!" : `Супер! Собрано 10 героев. Ваш бонус: ${currentBonus}₽`);
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

function updateUI() {
    const el = document.getElementById('character-count');
    if (el) el.textContent = caughtCharacters;
}

// Общая анимация падения
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
    @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(110vh) rotate(360deg); }
    }
    .selected-card { box-shadow: 0 0 25px var(--green); transform: translateY(-5px); transition: 0.3s; }
`;
document.head.appendChild(styleSheet);
