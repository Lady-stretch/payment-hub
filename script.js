// ==========================================
// 1. КОНФИГУРАЦИЯ И ПАМЯТЬ
// ==========================================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Грации!", "Красоты!", "Здоровья!", "Счастья!", "Энергии!", "Гибкости!"];

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let isLightTheme = localStorage.getItem('theme') === 'light';
let currentInstallmentLink = ""; 

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
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
// 3. ЛОГИКА АБОНЕМЕНТОВ
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
            let rawLink = this.getAttribute('data-link') || "";
            currentInstallmentLink = rawLink.replace(/&quot;/g, '').replace(/"/g, '').trim();

            document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
            
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
    if (currentInstallmentLink) {
        window.open(currentInstallmentLink, '_blank');
    } else {
        alert("Ссылка для данного тарифа не найдена.");
    }
}

function goBack() {
    const p = document.getElementById('payment');
    if (p) p.style.display = 'none';
    document.querySelectorAll('.card').forEach(c => c.style.border = "none");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 4. НОВОГОДНЯЯ ИГРА И ЭФФЕКТЫ
// ==========================================

function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.35; // Шанс появления персонажа
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄';
        char.className = 'game-character';
        
        Object.assign(char.style, {
            position: 'fixed', top: '-60px', left: (10 + Math.random() * 80) + 'vw',
            fontSize: '45px', zIndex: '10000', cursor: 'pointer',
            userSelect: 'none',
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
    if (counter) {
        counter.textContent = caughtCharacters;
        // Эффект пульсации
        counter.style.transition = "0.2s";
        counter.style.transform = "scale(1.4)";
        counter.style.color = "#2ecc71";
        setTimeout(() => {
            counter.style.transform = "scale(1)";
            counter.style.color = "";
        }, 200);
    }
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }
    
    launchConfetti(); // Запуск салюта

    // Показываем красивое окно
    const winModal = document.createElement('div');
    winModal.className = 'glass';
    Object.assign(winModal.style, {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: '30000', padding: '40px', textAlign: 'center', borderRadius: '20px',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)', minWidth: '320px', border: '2px solid var(--green)'
    });
    
    winModal.innerHTML = `
        <div style="font-size: 50px;">🦢</div>
        <h2 style="color: var(--green); margin: 15px 0;">Праздник к нам пришел!</h2>
        <p>Вы собрали 10 подарков! Ваша персональная скидка увеличилась.</p>
        <div style="font-size: 24px; font-weight: 900; margin: 20px 0; color: var(--green);">Бонус: ${currentBonus} ₽</div>
        <button id="close-win" class="select" style="width: 200px;">Продолжить</button>
    `;
    
    document.body.appendChild(winModal);
    document.getElementById('close-win').onclick = () => winModal.remove();

    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

// Эффект конфетти
function launchConfetti() {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed; left: 50vw; top: 50vh;
            width: 10px; height: 10px;
            background: ${['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6'][Math.floor(Math.random()*5)]};
            border-radius: 50%; z-index: 25000; pointer-events: none;
        `;
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let posX = 50, posY = 50;
        let life = 100;

        const move = setInterval(() => {
            posX += vx; posY += vy;
            life -= 2;
            particle.style.transform = `translate(${posX-50}vw, ${posY-50}vh)`;
            particle.style.opacity = life / 100;
            if (life <= 0) { clearInterval(move); particle.remove(); }
        }, 20);
    }
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

// ==========================================
// 5. ТЕМА, СНЕГ И ТАЙМЕР
// ==========================================
function toggleTheme() { isLightTheme = !isLightTheme; applyTheme(); localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); initStars(); }
function applyTheme() { document.body.classList.toggle('light-theme', isLightTheme); }

function initSnow() { 
    const container = document.querySelector('.snow-container'); 
    if (!container) return; 
    setInterval(() => { 
        const f = document.createElement('div'); 
        f.innerHTML = '❄'; 
        f.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${Math.random()}; animation:fall 8s linear forwards; color:white; pointer-events:none; z-index:5;`; 
        container.appendChild(f); 
        setTimeout(()=>f.remove(), 8000); 
    }, 400); 
}

function initStars() { 
    const container = document.querySelector('.stars-container'); 
    if (!container || isLightTheme) return; 
    container.innerHTML = ''; 
    for (let i=0; i<50; i++) { 
        const s = document.createElement('div'); 
        s.style.cssText = `position:absolute; width:2px; height:2px; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()};`; 
        container.appendChild(s); 
    } 
}

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

// CSS анимация для падения (добавьте в style.css если её там нет)
const style = document.createElement('style');
style.innerHTML = `
@keyframes character-fall {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(110vh) rotate(360deg); }
}
`;
document.head.appendChild(style);
