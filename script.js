// ==========================================
// 1. КОНФИГУРАЦИЯ И ПАМЯТЬ
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
// 3. ЛОГИКА МАГАЗИНА
// ==========================================
function setupShopLogic() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.game-character')) return;

            document.querySelectorAll('.card').forEach(c => c.style.border = "none");
            this.style.border = "2px solid #4a6fa5";

            const paymentSection = document.getElementById('payment');
            if (!paymentSection) return;
            paymentSection.style.display = 'block';
            
            const price = this.getAttribute('data-price');
            const installments = this.getAttribute('data-installments');
            const cardTitle = this.querySelector('h3') ? this.querySelector('h3').innerText : "";
            const hasMaxBonus = currentBonus >= MAX_BONUS;
            
            let finalLink = this.getAttribute('data-link') || "";
            if (hasMaxBonus) {
                if (cardTitle.includes("96")) finalLink = SALE_LINKS.installment96;
                else if (cardTitle.includes("64")) finalLink = SALE_LINKS.installment64;
            }
            currentInstallmentLink = finalLink.replace(/&quot;/g, '').replace(/"/g, '').trim();

            const displayPrice = hasMaxBonus ? (Number(price) - 1000) : Number(price);
            document.getElementById('selected-price').textContent = displayPrice.toLocaleString('ru-RU');

            const cardPayBtn = document.getElementById('sbp-link');
            if (cardPayBtn) {
                cardPayBtn.href = hasMaxBonus ? SALE_LINKS.card : "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E";
            }
            
            const instBtn = document.getElementById('installment-btn');
            const monthsDisplay = document.getElementById('months');
            if (installments && installments !== 'Нет' && currentInstallmentLink !== "") {
                if (instBtn) instBtn.style.display = 'block';
                if (monthsDisplay) monthsDisplay.textContent = installments + ' мес';
            } else {
                if (instBtn) instBtn.style.display = 'none';
            }

            paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function openInstallment() {
    if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank');
}

function goBack() {
    const p = document.getElementById('payment');
    if (p) p.style.display = 'none';
    document.querySelectorAll('.card').forEach(c => c.style.border = "none");
    window.scrollTo({ top: document.getElementById('packages').offsetTop, behavior: 'smooth' });
}

// ==========================================
// 4. ИГРА И ЭФФЕКТЫ
// ==========================================
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.35; 
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer', userSelect: 'none',
            animation: `character-fall ${7 + Math.random() * 3}s linear forwards`
        });

        if (isBonus) {
            const handleCatch = (e) => {
                e.preventDefault(); e.stopPropagation();
                showClickEffect(char, `✨ +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                char.remove();
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            };
            char.onclick = handleCatch;
            char.ontouchstart = handleCatch;
        }
        document.body.appendChild(char);
        setTimeout(() => char.remove(), 10000);
    }, 2500);
}

function updateUI() {
    const counter = document.getElementById('character-count');
    if (counter) counter.textContent = caughtCharacters;
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }
    alert(currentBonus >= MAX_BONUS ? "СКИДКА 1000₽ АКТИВИРОВАНА!" : `Бонус начислен! Всего: ${currentBonus}₽`);
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

// ==========================================
// 5. ВИЗУАЛ (Звезды, Снег, Таймер)
// ==========================================
function initStars() { 
    const container = document.querySelector('.stars-container'); 
    if (!container) return; 
    container.innerHTML = ''; 
    if (isLightTheme) return;
    for (let i=0; i<150; i++) { 
        const s = document.createElement('div'); 
        s.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; border-radius:50%;`; 
        container.appendChild(s); 
    } 
}

function initSnow() { 
    const container = document.querySelector('.snow-container'); 
    if (!container) return; 
    setInterval(() => { 
        const f = document.createElement('div'); 
        f.innerHTML = '❄'; 
        f.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${Math.random()}; animation:character-fall 8s linear forwards; color:white; pointer-events:none; z-index:5;`; 
        container.appendChild(f); 
        setTimeout(()=>f.remove(), 8000); 
    }, 400); 
}

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
        const pad = (num) => num < 10 ? '0' + num : num;
        t.textContent = `${pad(d)}д : ${pad(h)}ч : ${pad(m)}м : ${pad(s)}с`;
    }, 1000);
}

function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function showClickEffect(el, text) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = text;
    eff.style.cssText = `position: fixed; left: ${rect.left}px; top: ${rect.top}px; color: #FFD700; font-weight: bold; z-index: 15000; font-size: 20px; pointer-events: none; transition: 1.2s;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-100px)'; eff.style.opacity = '0'; }, 20);
    setTimeout(() => eff.remove(), 1200);
}

const styleTag = document.createElement('style');
styleTag.innerHTML = `@keyframes character-fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }`;
document.head.appendChild(styleTag);
