// 1. КОНФИГУРАЦИЯ
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

// 2. ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initStars();
    initSnow();
    initTimer();
    setupShopLogic(); 
    startCharacterGame();
    updateUI();
});

// 3. ТАЙМЕР (Исправлен формат)
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
        
        const pad = (n) => n < 10 ? '0' + n : n;
        t.innerHTML = `${pad(d)}д : ${pad(h)}ч : ${pad(m)}м : ${pad(s)}с`;
    }, 1000);
}

// 4. МАГАЗИН И ОПЛАТА
function setupShopLogic() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.game-character')) return;

            document.querySelectorAll('.card').forEach(c => c.classList.remove('selected-card'));
            this.classList.add('selected-card');

            const paymentSection = document.getElementById('payment');
            paymentSection.style.display = 'block';
            
            const price = this.getAttribute('data-price');
            const installments = this.getAttribute('data-installments');
            const hasMaxBonus = currentBonus >= MAX_BONUS;
            
            // Логика ссылок
            let finalInstLink = this.getAttribute('data-link') || "";
            const title = this.querySelector('h3').innerText;
            
            if (hasMaxBonus) {
                if (title.includes("96")) finalInstLink = SALE_LINKS.installment96;
                else if (title.includes("64")) finalInstLink = SALE_LINKS.installment64;
                document.getElementById('sbp-link').href = SALE_LINKS.card;
            } else {
                document.getElementById('sbp-link').href = "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E";
            }
            currentInstallmentLink = finalInstLink;

            // Вывод цены
            const displayPrice = hasMaxBonus ? (Number(price) - 1000) : Number(price);
            document.getElementById('selected-price').textContent = displayPrice.toLocaleString('ru-RU');

            // Рассрочка
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

function openInstallment() { if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank'); }
function goBack() { 
    document.getElementById('payment').style.display = 'none'; 
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected-card'));
    window.scrollTo({ top: document.getElementById('packages').offsetTop - 100, behavior: 'smooth' });
}

// 5. ИГРА (Новогодние герои)
function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (Math.random() * 90) + 'vw',
            fontSize: '40px', zIndex: '10000', cursor: 'pointer', userSelect: 'none',
            animation: `fall ${6 + Math.random() * 4}s linear forwards`
        });

        if (isBonus) {
            const catchFn = (e) => {
                e.preventDefault();
                showClickEffect(char, `✨ +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
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
    }, 2500);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }
    alert(currentBonus >= MAX_BONUS ? "ПОЗДРАВЛЯЕМ! Вы набрали 1000₽ скидки!" : `Отлично! Ваш бонус: ${currentBonus}₽`);
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

// 6. ВИЗУАЛ (Звезды и снег)
function initStars() { 
    const container = document.querySelector('.stars-container'); 
    if (!container || isLightTheme) { if(container) container.innerHTML=''; return; }
    container.innerHTML = ''; 
    for (let i = 0; i < 150; i++) {
        const s = document.createElement('div');
        const size = (Math.random() * 3) + 'px';
        s.className = 'star';
        s.style.cssText = `left:${Math.random()*100}%; top:${Math.random()*100}%; width:${size}; height:${size}; --duration:${2+Math.random()*3}s;`;
        container.appendChild(s); 
    } 
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    setInterval(() => {
        const s = document.createElement('div');
        s.innerHTML = '❄';
        s.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${Math.random()}; animation:fall 10s linear forwards; color:white; pointer-events:none; z-index:5;`;
        container.appendChild(s);
        setTimeout(() => s.remove(), 10000);
    }, 500);
}

function updateUI() { if(document.getElementById('character-count')) document.getElementById('character-count').textContent = caughtCharacters; }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); document.getElementById('theme-toggle').innerHTML = isLightTheme ? '☀️' : '🌙'; }
function toggleTheme() { isLightTheme = !isLightTheme; localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); applyTheme(); initStars(); }
function showClickEffect(el, txt) { /* Эффект всплывающего текста */ }

// Стили анимации в JS
const style = document.createElement('style');
style.innerHTML = `@keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }`;
document.head.appendChild(style);
