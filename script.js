// ==========================================
// 1. КОНСТАНТЫ И НАСТРОЙКИ
// ==========================================
const CHARACTERS_PER_LEVEL = 10;
const BONUS_STEP = 200;
const MAX_BONUS = 1000;

// Тот самый список пожеланий
const WISHES = [
    "Шпагата!", "Грации!", "Красоты!", 
    "Здоровья!", "Счастья!", "Энергии!", 
    "Гибкости!", "Любви!", "Уверенности!"
];

// Ссылки на оплату (Обычные и со скидкой 1000р)
const PAY_LINKS = {
    sbp_default: "https://qr.nspk.ru/AS2A006F0RCJU7V991SBLV4AACJGFT2P?type=01&bank=100000000004&crc=A93E",
    sbp_sale: "https://checkout.tochka.com/c86b3625-580b-46a8-93ff-88394a302610",
    installment96_sale: "https://ecom.otpbank.ru/smart-form?config=4ba599c9-4baa-40c1-8573-6b6945cdb73e",
    installment64_sale: "https://ecom.otpbank.ru/smart-form?config=c915eef7-212b-4548-9c12-06d8757135d6"
};

// Состояние (берем из памяти браузера)
let caughtCharacters = parseInt(localStorage.getItem('caughtCharacters')) || 0;
let currentBonus = parseInt(localStorage.getItem('totalBonus')) || 0;
let currentInstallmentLink = "";

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initStars(150); // 150 мерцающих звезд
    initSnow();     // Падающий снег
    initTimer();    // Ледяной таймер
    initGame();     // Запуск появления героев
    setupShop();    // Логика выбора абонементов
    updateUI();     // Обновление счетчика на экране
});

// ==========================================
// 3. ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
// ==========================================
function initStars(count) {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 'px';
        star.style.cssText = `
            position: absolute;
            width: ${size}; height: ${size};
            background: white;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            border-radius: 50%;
            opacity: ${Math.random()};
            animation: twinkle ${2 + Math.random() * 3}s infinite ease-in-out;
        `;
        container.appendChild(star);
    }
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    setInterval(() => {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: fixed; top: -20px;
            left: ${Math.random() * 100}vw;
            color: white; opacity: ${Math.random()};
            font-size: ${10 + Math.random() * 20}px;
            z-index: 5; pointer-events: none;
            animation: fall ${5 + Math.random() * 5}s linear forwards;
        `;
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 8000);
    }, 400);
}

function initTimer() {
    const timerDisplay = document.getElementById('countdown-timer');
    const targetDate = new Date('January 1, 2026 00:00:00').getTime();

    function update() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff <= 0) {
            timerDisplay.textContent = "С НОВЫМ ГОДОМ! 🎉";
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = (n) => n < 10 ? '0' + n : n;
        timerDisplay.textContent = `${pad(d)}д : ${pad(h)}ч : ${pad(m)}м : ${pad(s)}с`;
    }
    setInterval(update, 1000);
    update();
}

// ==========================================
// 4. ИГРОВАЯ ЛОГИКА
// ==========================================
function initGame() {
    setInterval(() => {
        const isHero = Math.random() > 0.3; // 70% шанс появления героя, 30% снежинки
        const char = document.createElement('div');
        char.innerHTML = isHero ? ['⛄', '🎅', '🎁', '🦌', '🌟'][Math.floor(Math.random() * 5)] : '❄️';
        char.style.cssText = `
            position: fixed; top: -60px;
            left: ${10 + Math.random() * 80}vw;
            font-size: 45px; z-index: 20000;
            cursor: pointer; user-select: none;
            animation: fall 7s linear forwards;
        `;

        char.onclick = (e) => {
            if (isHero) {
                catchHero(char);
            } else {
                char.style.opacity = '0.3'; // Просто снежинка
            }
        };
        document.body.appendChild(char);
    }, 2200);
}

function catchHero(element) {
    const rect = element.getBoundingClientRect();
    const wish = WISHES[Math.floor(Math.random() * WISHES.length)];
    
    // Эффект вылетающего текста
    const text = document.createElement('div');
    text.innerHTML = `✨ +1 ${wish}`;
    text.style.cssText = `
        position: fixed; left: ${rect.left}px; top: ${rect.top}px;
        color: #FFD700; font-weight: 900; font-size: 24px;
        z-index: 21000; transition: 1.5s; pointer-events: none;
        text-shadow: 0 0 10px #000;
    `;
    document.body.appendChild(text);
    setTimeout(() => {
        text.style.transform = 'translateY(-120px) scale(1.4)';
        text.style.opacity = '0';
    }, 50);
    setTimeout(() => text.remove(), 1500);

    caughtCharacters++;
    localStorage.setItem('caughtCharacters', caughtCharacters);
    updateUI();

    if (caughtCharacters >= CHARACTERS_PER_LEVEL) {
        applyBonus();
    }
    element.remove();
}

function applyBonus() {
    if (currentBonus < MAX_BONUS) {
        currentBonus += BONUS_STEP;
        localStorage.setItem('totalBonus', currentBonus);
    }

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    const modal = document.getElementById('win-modal');
    const winText = document.getElementById('win-text');
    
    if (currentBonus >= MAX_BONUS) {
        winText.innerHTML = "ВЫ СОБРАЛИ МАКСИМАЛЬНУЮ СКИДКУ!<br><br><strong>Скидка 1000₽</strong> активирована для всех абонементов!";
    } else {
        winText.innerHTML = `Вы поймали 10 героев!<br>Ваша скидка выросла на 200₽.<br>Текущий бонус: <strong>${currentBonus}₽</strong>`;
    }
    
    modal.style.display = 'flex';
    caughtCharacters = 0;
    localStorage.setItem('caughtCharacters', 0);
    updateUI();
}

// ==========================================
// 5. МАГАЗИН И ОПЛАТА
// ==========================================
function setupShop() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            // Визуальное выделение
            document.querySelectorAll('.card').forEach(c => c.style.border = "none");
            this.style.border = "3px solid var(--green)";

            const price = parseInt(this.getAttribute('data-price'));
            const installments = this.getAttribute('data-installments');
            const title = this.querySelector('h3').innerText;
            const hasMaxBonus = currentBonus >= MAX_BONUS;

            // Показываем блок оплаты
            const paymentSection = document.getElementById('payment');
            paymentSection.style.display = 'block';

            // Расчет итоговой цены
            const finalPrice = hasMaxBonus ? (price - 1000) : price;
            document.getElementById('selected-price').textContent = finalPrice.toLocaleString('ru-RU');

            // Управление ссылками и QR-кодом
            const qrBlock = document.getElementById('qr-block');
            const sbpLink = document.getElementById('sbp-link');

            if (hasMaxBonus) {
                qrBlock.style.display = 'none'; // Убираем старый QR, так как ссылка новая
                sbpLink.href = PAY_LINKS.sbp_sale;
                
                // Ссылки на рассрочку со скидкой
                if (title.includes("96")) currentInstallmentLink = PAY_LINKS.installment96_sale;
                else if (title.includes("64")) currentInstallmentLink = PAY_LINKS.installment64_sale;
                else currentInstallmentLink = "";
            } else {
                qrBlock.style.display = 'block'; // Показываем QR оплаты на месте
                sbpLink.href = PAY_LINKS.sbp_default;
                currentInstallmentLink = this.getAttribute('data-link') || "";
            }

            // Кнопка рассрочки
            const instBtn = document.getElementById('installment-btn');
            if (installments !== "Нет" && currentInstallmentLink !== "") {
                instBtn.style.display = 'block';
                document.getElementById('months').textContent = installments + ' мес';
            } else {
                instBtn.style.display = 'none';
            }

            paymentSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ==========================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function closeWinModal() { document.getElementById('win-modal').style.display = 'none'; }
function goBack() { document.getElementById('payment').style.display = 'none'; }
function openInstallment() { if (currentInstallmentLink) window.open(currentInstallmentLink, '_blank'); }
function updateUI() { document.getElementById('character-count').textContent = caughtCharacters; }

// Стили анимаций
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(110vh) rotate(360deg); }
    }
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
`;
document.head.appendChild(style);
