const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;
const WISHES = ["Шпагата!", "Грации!", "Красоты!", "Здоровья!", "Счастья!", "Энергии!", "Гибкости!", "Любви!"];

const SALE_LINKS = {
    card: "https://checkout.tochka.com/c86b3625-580b-46a8-93ff-88394a302610",
    installment96: "https://ecom.otpbank.ru/smart-form?config=4ba599c9-4baa-40c1-8573-6b6945cdb73e",
    installment64: "https://ecom.otpbank.ru/smart-form?config=c915eef7-212b-4548-9c12-06d8757135d6"
};

let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    initStars(); // 150 мерцающих звезд
    initSnow(); // Снег
    initTimer(); // Ледяной таймер
    setupShopLogic(); 
    startCharacterGame();
    updateUI();
});

function initStars() { 
    const container = document.querySelector('.stars-container'); 
    container.innerHTML = ''; 
    for (let i = 0; i < 150; i++) { 
        const s = document.createElement('div'); 
        const size = Math.random() * 3 + 'px';
        s.style.cssText = `position:absolute; width:${size}; height:${size}; background:white; left:${Math.random()*100}%; top:${Math.random()*100}%; opacity:${Math.random()}; border-radius:50%; pointer-events:none; animation: twinkle ${2+Math.random()*3}s infinite;`; 
        container.appendChild(s); 
    } 
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    setInterval(() => {
        const f = document.createElement('div');
        f.innerHTML = '❄';
        f.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; opacity:${Math.random()}; animation:fall 8s linear forwards; color:white; pointer-events:none; z-index:5; font-size:${10+Math.random()*20}px;`;
        container.appendChild(f);
        setTimeout(() => f.remove(), 8000);
    }, 450);
}

function initTimer() {
    const t = document.getElementById('countdown-timer');
    const target = new Date('January 1, 2026 00:00:00').getTime();
    setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) { t.textContent = "С НОВЫМ ГОДОМ! 🎉"; return; }
        const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        const p = (n) => n < 10 ? '0'+n : n;
        t.textContent = `${p(d)}д : ${p(h)}ч : ${p(m)}м : ${p(s)}с`;
    }, 1000);
}

function startCharacterGame() {
    setInterval(() => {
        const isBonus = Math.random() > 0.4;
        const char = document.createElement('div');
        char.innerHTML = isBonus ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random()*5)] : '❄';
        char.className = 'game-character';
        Object.assign(char.style, { position:'fixed', top:'-60px', left:(10+Math.random()*80)+'vw', fontSize:'45px', zIndex:'20000', cursor:'pointer', animation:'fall 8s linear forwards' });
        
        char.onclick = (e) => {
            if (isBonus) {
                showClickEffect(char, `✨ +1 ${WISHES[Math.floor(Math.random()*WISHES.length)]}`);
                caughtCharacters++;
                localStorage.setItem('caughtCharacters', caughtCharacters);
                updateUI();
                if (caughtCharacters >= CHARACTERS_PER_LEVEL) processWin();
            }
            char.remove();
        };
        document.body.appendChild(char);
    }, 2400);
}

function showClickEffect(el, txt) {
    const rect = el.getBoundingClientRect();
    const eff = document.createElement('div');
    eff.innerHTML = txt;
    eff.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; color:#FFD700; font-weight:900; z-index:25000; font-size:24px; transition:1.5s; pointer-events:none;`;
    document.body.appendChild(eff);
    setTimeout(() => { eff.style.transform = 'translateY(-100px) scale(1.5)'; eff.style.opacity = '0'; }, 50);
    setTimeout(() => eff.remove(), 1500);
}

function processWin() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    const modal = document.getElementById('win-modal');
    document.getElementById('win-text').innerHTML = `Вы поймали 10 героев! Бонус: ${currentBonus}₽`;
    modal.style.display = 'flex';
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

function setupShopLogic() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.card').forEach(c => c.style.border = "none");
            this.style.border = "3px solid #2ecc71";
            const paySec = document.getElementById('payment');
            paySec.style.display = 'block';
            
            const price = this.getAttribute('data-price');
            const inst = this.getAttribute('data-installments');
            const hasMax = currentBonus >= MAX_BONUS;
            const title = this.querySelector('h3').innerText;

            if (hasMax) {
                if (title.includes("96")) currentInstallmentLink = SALE_LINKS.installment96;
                else if (title.includes("64")) currentInstallmentLink = SALE_LINKS.installment64;
                document.getElementById('sbp-link').href = SALE_LINKS.card;
            } else {
                document.getElementById('sbp-link').href = "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E";
            }
            
            document.getElementById('selected-price').textContent = (hasMax ? (Number(price) - 1000) : Number(price)).toLocaleString('ru-RU');
            const instBtn = document.getElementById('installment-btn');
            if (inst !== 'Нет') {
                instBtn.style.display = 'block';
                document.getElementById('months').textContent = inst + ' мес';
            } else { instBtn.style.display = 'none'; }
            paySec.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function closeWinModal() { document.getElementById('win-modal').style.display = 'none'; }
function goBack() { document.getElementById('payment').style.display = 'none'; }
function openInstallment() { if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank'); }
function updateUI() { document.getElementById('character-count').textContent = caughtCharacters; }

const styleTag = document.createElement('style');
styleTag.innerHTML = `
    @keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }
    @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
`;
document.head.appendChild(styleTag);
