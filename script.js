// ======================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ======================
let currentInstallment = null;
let caughtCharacters = 0;
const CHARACTERS_FOR_REWARD = 10;
let hasReward = false;
let isLightTheme = false;
let decorativeSnowInterval;
let characterInterval;
let isGameActive = true;
let characterCounter = 0;

const CLICKABLE_CHARACTERS = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const NON_CLICKABLE_CHARACTERS = ['❄', '✨', '🥶', '🧊', '🍂'];
const CHARACTER_NAMES = {
  '⛄': 'Снеговик', '🎅': 'Дед Мороз', '🎁': 'Подарок', '🦌': 'Олень',
  '🌟': 'Звезда', '❄': 'Снежинка', '✨': 'Искорка', '🥶': 'Замёрзший',
  '🧊': 'Лёд', '🍂': 'Осенний лист'
};

const PROGRESS_MESSAGES = {
  2: "🎁 Вы собрали 2 подарка! Продолжайте!",
  5: "🌟 Уже 5! Вы на полпути к сюрпризу!",
  8: "✨ Осталось всего 2 подарка! Почти у цели!"
};

const FINAL_CONGRATS = [
  "🎉 Поздравляем! Вы собрали 10 новогодних подарков!",
  "Ваш подарок: <strong>500 ₽ скидка</strong> на любой абонемент!",
  "*Покажите этот экран администратору",
  "«Здоровье — лучший подарок!»"
];

// ======================
// ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎄 Система запущена');
  loadSavedData();
  createStars();
  startDecorativeSnow();
  updateTimer();
  setInterval(updateTimer, 1000);
  setupEventListeners();
  
  // Запуск игры с небольшой задержкой для прогрузки DOM
  setTimeout(startCharacterGame, 1000);
  updateCharacterCounter();
});

// ======================
// ТАЙМЕР
// ======================
const END_DATE = new Date('January 1, 2026 00:00:00 GMT+0300');

function updateTimer() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;
  const diff = END_DATE - Date.now();
  if (diff <= 0) {
    el.innerHTML = '<span style="color: var(--green)">С НОВЫМ ГОДОМ! 🎄</span>';
    return;
  }
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  const format = (num) => num < 10 ? '0' + num : num;

  el.innerHTML = `${format(d)}д : ${format(h)}ч : ${format(m)}м : ${format(s)}с`;
}

// ======================
// ИГРА: ПЕРСОНАЖИ (ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ)
// ======================
function createGameCharacter() {
  if (!isGameActive) return;

  characterCounter++;
  // Каждый 3-й персонаж — кликабельный
  const isClickable = (characterCounter % 3 === 0);
  const characterArray = isClickable ? CLICKABLE_CHARACTERS : NON_CLICKABLE_CHARACTERS;
  const emoji = characterArray[Math.floor(Math.random() * characterArray.length)];
  
  const charEl = document.createElement('div');
  charEl.className = `new-year-character ${isClickable ? 'clickable' : 'non-clickable'}`;
  charEl.innerHTML = `${emoji}<div class="character-tooltip" style="font-size: 12px; background: rgba(0,0,0,0.7); color: white; padding: 2px 5px; border-radius: 4px; position: absolute; top: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; visibility: hidden;">${isClickable ? 'Кликни!' : 'Мимо!'}</div>`;
  
  // Принудительные стили через JS, чтобы "перебить" CSS
  Object.assign(charEl.style, {
    position: 'fixed',
    top: '-80px',
    left: (Math.random() * 80 + 10) + 'vw',
    fontSize: '45px',
    zIndex: '999999', // Максимальный приоритет
    cursor: 'pointer',
    pointerEvents: 'auto', // Чтобы клик точно работал
    userSelect: 'none',
    display: 'block'
  });

  // Ускоряем анимацию, чтобы персонаж не "висел"
  const duration = 7 + Math.random() * 5; 
  charEl.style.animation = `character-fall ${duration}s linear forwards`;
  
  charEl.dataset.clickable = isClickable.toString();
  
  // Клик и Тач (для телефонов)
  const onCapture = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCharacterClick(charEl);
  };
  
  charEl.addEventListener('mousedown', onCapture);
  charEl.addEventListener('touchstart', onCapture, { passive: false });
  
  // Добавляем ПРЯМО В BODY, а не в контейнеры
  document.body.appendChild(charEl);
  
  // Очистка
  setTimeout(() => { if (charEl.parentNode) charEl.remove(); }, duration * 1000);
}

function handleCharacterClick(char) {
  const isClickable = char.dataset.clickable === 'true';
  const rect = char.getBoundingClientRect();
  
  if (isClickable) {
    createClickEffect(rect.left, rect.top, '🎉 +1', '#FFD700');
    caughtCharacters++;
    localStorage.setItem('charactersCaught', caughtCharacters);
    updateCharacterCounter();
    checkProgress();
    if (caughtCharacters >= CHARACTERS_FOR_REWARD && !hasReward) {
      hasReward = true;
      localStorage.setItem('characterReward', 'true');
      showFinalReward();
    }
  } else {
    createClickEffect(rect.left, rect.top, '❌ Мимо', '#ff4444');
  }
  char.remove();
}

function createClickEffect(x, y, text, color) {
  const effect = document.createElement('div');
  effect.style.cssText = `position:fixed; left:${x}px; top:${y}px; color:${color}; z-index:1000000; font-weight:bold; pointer-events:none; transition:all 0.8s; font-size:24px;`;
  effect.textContent = text;
  document.body.appendChild(effect);
  setTimeout(() => {
    effect.style.transform = 'translateY(-60px)';
    effect.style.opacity = '0';
  }, 20);
  setTimeout(() => effect.remove(), 1000);
}

// ======================
// УПРАВЛЕНИЕ ИГРОЙ
// ======================
function startCharacterGame() {
  if (characterInterval) clearInterval(characterInterval);
  characterInterval = setInterval(createGameCharacter, 3500);
}

function updateCharacterCounter() {
  const countSpan = document.getElementById('character-count');
  if (countSpan) countSpan.textContent = caughtCharacters;
  
  const counterBox = document.getElementById('character-counter');
  if (counterBox && hasReward) {
    counterBox.innerHTML = '🎉 Награда получена! 🎁';
  }
}

// ======================
// ТЕМЫ И ОПЛАТА
// ======================
function setupEventListeners() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!e.target.closest('button')) selectPackage.call(this);
    });
  });
}

function toggleTheme() {
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  location.reload(); 
}

function selectPackage() {
  const payment = document.getElementById('payment');
  if (payment) {
    payment.style.display = 'block';
    document.getElementById('selected-price').textContent = this.dataset.price;
    payment.scrollIntoView({ behavior: 'smooth' });
  }
}

function startDecorativeSnow() {
  const container = document.querySelector('.snow-container');
  if (!container) return;
  setInterval(() => {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + 'vw';
    flake.innerHTML = '❄';
    container.appendChild(flake);
    setTimeout(() => flake.remove(), 8000);
  }, 600);
}

function createStars() {
  const container = document.querySelector('.stars-container');
  if (!container || isLightTheme) return;
  for (let i = 0; i < 40; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    container.appendChild(star);
  }
}

function loadSavedData() {
  isLightTheme = localStorage.getItem('theme') === 'light';
  if (isLightTheme) document.body.classList.add('light-theme');
  caughtCharacters = parseInt(localStorage.getItem('charactersCaught')) || 0;
  hasReward = localStorage.getItem('characterReward') === 'true';
}

function showFinalReward() {
  const div = document.createElement('div');
  div.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; color:#222; padding:30px; border-radius:20px; z-index:1000000; text-align:center; box-shadow:0 0 100px rgba(0,0,0,0.9); border:4px solid #2ecc71; width:85%;";
  div.innerHTML = `<h2>🎉 Победа!</h2><p>${FINAL_CONGRATS[1]}</p><button onclick="this.parentElement.remove()" style="margin-top:20px; padding:10px 20px; background:#2ecc71; color:white; border:none; border-radius:10px; cursor:pointer;">ОТЛИЧНО!</button>`;
  document.body.appendChild(div);
}

function checkProgress() {
  if (PROGRESS_MESSAGES[caughtCharacters]) {
    const msg = document.getElementById('progress-notification');
    if (msg) {
      msg.textContent = PROGRESS_MESSAGES[caughtCharacters];
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 3000);
    }
  }
}
