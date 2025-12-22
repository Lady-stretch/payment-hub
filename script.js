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

// Кликабельные персонажи (каждый 3-й будет кликабельным)
const CLICKABLE_CHARACTERS = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const NON_CLICKABLE_CHARACTERS = ['❄', '✨', '🥶', '🧊', '🍂'];
const CHARACTER_NAMES = {
  '⛄': 'Снеговик',
  '🎅': 'Дед Мороз', 
  '🎁': 'Подарок',
  '🦌': 'Олень',
  '🌟': 'Звезда',
  '❄': 'Снежинка',
  '✨': 'Искорка',
  '🥶': 'Замёрзший',
  '🧊': 'Лёд',
  '🍂': 'Осенний лист'
};

// Прогресс-сообщения
const PROGRESS_MESSAGES = {
  2: "🎁 Вы собрали 2 подарка! Продолжайте!",
  5: "🌟 Уже 5! Вы на полпути к сюрпризу!",
  8: "✨ Осталось всего 2 подарка! Почти у цели!"
};

// Поздравления при финальной награде
const FINAL_CONGRATS = [
  "🎉 Поздравляем! Вы собрали 10 новогодних подарков!",
  "Ваш подарок: <strong>500 ₽ скидка</strong> на любой абонемент!",
  "*Покажите этот экран администратору",
  "«Здоровье — лучший подарок, который вы можете себе сделать!»"
];

// ======================
// ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎄 Страница загружена, запускаем новогоднее настроение...');
  
  loadSavedData();
  createStars();
  startDecorativeSnow();
  updateTimer();
  setInterval(updateTimer, 1000);
  setupEventListeners();
  startCharacterGame();
  updateCharacterCounter();
  
  console.log('✅ Инициализация завершена');
});

// ======================
// ТАЙМЕР ДО НОВОГО ГОДА
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
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    el.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
        <div style="display: flex; gap: 10px;">
          <span style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 1.8rem;">${format(d)}</span>
            <span style="font-size: 0.7rem; color: var(--snow-color);">дней</span>
          </span>
          <span style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 1.8rem;">${format(h)}</span>
            <span style="font-size: 0.7rem; color: var(--snow-color);">часов</span>
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <span style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 1.8rem;">${format(m)}</span>
            <span style="font-size: 0.7rem; color: var(--snow-color);">минут</span>
          </span>
          <span style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 1.8rem;">${format(s)}</span>
            <span style="font-size: 0.7rem; color: var(--snow-color);">секунд</span>
          </span>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <span style="display: inline-flex; align-items: baseline;">
        ${format(d)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">д</span>
      </span>:
      <span style="display: inline-flex; align-items: baseline;">
        ${format(h)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">ч</span>
      </span>:
      <span style="display: inline-flex; align-items: baseline;">
        ${format(m)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">м</span>
      </span>:
      <span style="display: inline-flex; align-items: center;">
        ${format(s)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">с</span>
      </span>
    `;
  }
}

// ======================
// ДЕКОРАТИВНЫЙ СНЕГ
// ======================
function createDecorativeSnowflake() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.style.left = Math.random() * 100 + 'vw';
  snowflake.style.fontSize = (Math.random() * 1.2 + 0.8) + 'em';
  snowflake.style.color = isLightTheme ? 'rgba(74, 111, 165, 0.7)' : 'rgba(180, 220, 255, 0.8)';
  
  const duration = Math.random() * 8 + 5;
  snowflake.style.animation = `fall ${duration}s linear infinite`;
  snowflake.style.opacity = Math.random() * 0.6 + 0.4;
  
  snowflake.innerHTML = ['❄', '•', '✻', '❉', '❅'][Math.floor(Math.random() * 5)];
  snowContainer.appendChild(snowflake);
  
  setTimeout(() => snowflake.remove(), duration * 1000);
}

function startDecorativeSnow() {
  for (let i = 0; i < 40; i++) {
    setTimeout(createDecorativeSnowflake, i * 100);
  }
  decorativeSnowInterval = setInterval(createDecorativeSnowflake, 500);
}

// ======================
// ИГРА: ПЕРСОНАЖИ
// ======================
function createGameCharacter() {
  if (hasReward || !isGameActive) return;
  
  characterCounter++;
  const isClickable = (characterCounter % 3 === 0);
  const characterArray = isClickable ? CLICKABLE_CHARACTERS : NON_CLICKABLE_CHARACTERS;
  const characterEmoji = characterArray[Math.floor(Math.random() * characterArray.length)];
  const characterName = CHARACTER_NAMES[characterEmoji];
  
  const characterElement = document.createElement('div');
  characterElement.className = `new-year-character ${isClickable ? 'clickable' : 'non-clickable'}`;
  characterElement.innerHTML = `${characterEmoji}<div class="character-tooltip">${isClickable ? 'Кликни!' : 'Мимо!'} ${characterName}</div>`;
  
  // Позиция
  characterElement.style.left = Math.random() * 80 + 10 + 'vw';
  characterElement.style.fontSize = (Math.random() * 20 + 35) + 'px';
  characterElement.style.zIndex = '1000';
  
  if (isLightTheme) {
    characterElement.style.filter = 'brightness(0.9)';
  }
  
  characterElement.dataset.emoji = characterEmoji;
  characterElement.dataset.name = characterName;
  characterElement.dataset.clickable = isClickable.toString();
  
  // Анимация
  const duration = Math.random() * 10 + 15;
  characterElement.style.animation = `character-fall ${duration}s linear forwards`;
  
  // События для ПК и мобильных
  characterElement.addEventListener('click', handleCharacterClick);
  characterElement.addEventListener('touchstart', function(event) {
    event.preventDefault();
    handleCharacterClick(event);
  }, { passive: false });
  
  const snowContainer = document.querySelector('.snow-container');
  if (snowContainer) {
    snowContainer.appendChild(characterElement);
    console.log(`🎯 Создан ${isClickable ? 'кликабельный' : 'некликабельный'} персонаж: ${characterName}`);
  }
  
  setTimeout(() => characterElement.remove(), duration * 1000);
}

function handleCharacterClick(event) {
  if (hasReward) return;
  
  const character = event.currentTarget;
  const isClickable = character.dataset.clickable === 'true';
  const name = character.dataset.name;
  
  const rect = character.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  character.style.transform = 'scale(0)';
  character.style.transition = 'transform 0.3s ease';
  
  if (isClickable) {
    createClickEffect(x, y, '🎉 С Новым Годом!', '#FFD700');
    caughtCharacters++;
    localStorage.setItem('charactersCaught', caughtCharacters.toString());
    updateCharacterCounter();
    checkProgress();
    checkForReward();
    console.log(`✅ Пойман ${name}! Всего: ${caughtCharacters}`);
  } else {
    createClickEffect(x, y, '❌ Промах!', '#ff4444');
    console.log(`❌ Промах: ${name}`);
  }
  
  setTimeout(() => character.remove(), 300);
}

function createClickEffect(x, y, text, color) {
  const effect = document.createElement('div');
  effect.className = 'click-effect';
  effect.textContent = text;
  effect.style.left = (x - 50) + 'px';
  effect.style.top = (y - 20) + 'px';
  effect.style.color = color;
  effect.style.fontWeight = 'bold';
  effect.style.zIndex = '10000';
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.style.transform = 'translateY(-30px)';
    effect.style.opacity = '0';
  }, 100);
  
  setTimeout(() => effect.remove(), 1000);
}

// ======================
// УПРАВЛЕНИЕ ИГРОЙ
// ======================
function startCharacterGame() {
  console.log('🎮 Запуск игры...', {hasReward, isGameActive});
  
  if (hasReward) {
    console.log('❌ Игра не запущена: уже есть награда');
    return;
  }
  
  isGameActive = true;
  if (characterInterval) clearInterval(characterInterval);
  
  // Первый персонаж через 1 секунду
  setTimeout(() => {
    console.log('🕐 Создаю первого персонажа...');
    createGameCharacter();
  }, 1000);
  
  // Затем каждые 3-5 секунд
  characterInterval = setInterval(() => {
    if (isGameActive && !hasReward) {
      createGameCharacter();
    }
  }, 3000 + Math.random() * 2000);
  
  console.log('✅ Игра запущена');
}

function stopCharacterGame() {
  isGameActive = false;
  if (characterInterval) {
    clearInterval(characterInterval);
    characterInterval = null;
  }
  document.querySelectorAll('.new-year-character').forEach(char => char.remove());
}

// ======================
// НАГРАДЫ И УВЕДОМЛЕНИЯ
// ======================
function showProgressNotification(message) {
  const notification = document.getElementById('progress-notification');
  if (!notification) return;
  
  notification.innerHTML = message;
  notification.style.display = 'block';
  notification.style.animation = 'slideDown 0.3s ease, progressPulse 2s infinite';
  setTimeout(() => notification.style.display = 'none', 3000);
}

function checkProgress() {
  if (PROGRESS_MESSAGES[caughtCharacters]) {
    showProgressNotification(PROGRESS_MESSAGES[caughtCharacters]);
  }
}

function checkForReward() {
  if (!hasReward && caughtCharacters >= CHARACTERS_FOR_REWARD) {
    hasReward = true;
    localStorage.setItem('characterReward', 'true');
    showFinalReward();
    updateCharacterCounter();
    stopCharacterGame();
    console.log('🎁 Все подарки собраны!');
  }
}

function showFinalReward() {
  const rewardElement = document.createElement('div');
  rewardElement.className = 'gift-notification';
  rewardElement.innerHTML = `
    <h3>${FINAL_CONGRATS[0]}</h3>
    <p>${FINAL_CONGRATS[1]}</p>
    <p><small>${FINAL_CONGRATS[2]}</small></p>
    <p style="font-style: italic; margin: 20px 0;">${FINAL_CONGRATS[3]}</p>
    <button onclick="this.parentElement.remove()">Забрать подарок!</button>
  `;
  document.body.appendChild(rewardElement);
  setTimeout(() => rewardElement.remove(), 15000);
}

function updateCharacterCounter() {
  const counter = document.getElementById('character-counter');
  const countSpan = document.getElementById('character-count');
  if (!counter || !countSpan) return;
  
  counter.style.display = 'block';
  countSpan.textContent = caughtCharacters;
  
  if (hasReward) {
    counter.innerHTML = '🎉 Все подарки получены! 🎁';
    counter.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
    counter.style.color = 'white';
  }
}

// ======================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ======================
function setupEventListeners() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('select') || e.target === this || 
          e.target.closest('.desc') || e.target.closest('.price')) {
        selectPackage.call(this);
      }
    });
    
    const selectBtn = card.querySelector('.select');
    if (selectBtn) {
      selectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectPackage.call(card);
      });
    }
  });
  
  const backButton = document.querySelector('.back-button');
  if (backButton) backButton.addEventListener('click', goBack);
}

function toggleTheme() {
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  
  clearInterval(decorativeSnowInterval);
  const snowContainer = document.querySelector('.snow-container');
  if (snowContainer) snowContainer.innerHTML = '';
  startDecorativeSnow();
  
  const starsContainer = document.querySelector('.stars-container');
  if (starsContainer) starsContainer.innerHTML = '';
  if (!isLightTheme) createStars();
  
  console.log(isLightTheme ? '☀️ Светлая тема' : '🌙 Темная тема');
  updateCharacterCounter();
}

// ======================
// ЛОГИКА ПАКЕТОВ
// ======================
function selectPackage() {
  document.querySelectorAll('.card').forEach(c => {
    c.style.borderColor = '';
    c.style.borderWidth = '';
    c.style.borderStyle = '';
  });
  
  this.style.borderColor = '#4a6fa5';
  this.style.borderWidth = '2px';
  this.style.borderStyle = 'solid';
  
  const paymentSection = document.getElementById('payment');
  if (!paymentSection) return;
  
  paymentSection.style.display = 'block';
  const price = this.getAttribute('data-price');
  document.getElementById('selected-price').textContent = Number(price).toLocaleString('ru-RU');
  
  const installmentBtn = document.getElementById('installment-btn');
  const installments = this.getAttribute('data-installments');
  
  if (installments && installments !== 'Нет') {
    currentInstallment = this.getAttribute('data-link');
    document.getElementById('months').textContent = installments + ' мес';
    installmentBtn.style.display = 'block';
  } else {
    installmentBtn.style.display = 'none';
  }
  
  paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openInstallment() {
  if (currentInstallment) window.open(currentInstallment, '_blank');
}

function goBack() {
  document.getElementById('payment').style.display = 'none';
  document.querySelectorAll('.card').forEach(card => {
    card.style.borderColor = '';
    card.style.borderWidth = '';
    card.style.borderStyle = '';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// ЗВЁЗДЫ
// ======================
function createStars() {
  if (isLightTheme) return;
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  starsContainer.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.width = star.style.height = (Math.random() * 2 + 1) + 'px';
    star.style.opacity = Math.random() * 0.6 + 0.2;
    star.style.animationDuration = Math.random() * 4 + 2 + 's';
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
  }
}

// ======================
// ЗАГРУЗКА ДАННЫХ
// ======================
function loadSavedData() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightTheme = true;
    document.body.classList.add('light-theme');
  }
  
  const savedCharacters = localStorage.getItem('charactersCaught');
  if (savedCharacters) caughtCharacters = parseInt(savedCharacters);
  
  const savedReward = localStorage.getItem('characterReward');
  if (savedReward === 'true') hasReward = true;
  
  console.log('Загружены данные:', {isLightTheme, caughtCharacters, hasReward});
}

// ======================
// СЛУЖЕБНЫЕ ФУНКЦИИ
// ======================
window.addEventListener('resize', updateTimer);

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    isGameActive = false;
    if (characterInterval) {
      clearInterval(characterInterval);
      characterInterval = null;
    }
  } else if (!hasReward) {
    isGameActive = true;
    if (!characterInterval) startCharacterGame();
  }
});

// ======================
// АВАРИЙНЫЙ ЗАПУСК
// ======================
setTimeout(() => {
  console.log('=== ПРОВЕРКА ИГРЫ ЧЕРЕЗ 5 СЕКУНД ===');
  console.log('hasReward:', hasReward);
  console.log('isGameActive:', isGameActive);
  console.log('characterInterval:', characterInterval);
  
  if (!characterInterval && !hasReward) {
    console.log('🔄 Перезапускаем игру вручную...');
    startCharacterGame();
  }
}, 5000);

// ======================
// ТЕСТОВЫЕ ПЕРСОНАЖИ
// ======================
setTimeout(() => {
  console.log('=== ЭКСТРЕННЫЙ ТЕСТ ИГРЫ ЧЕРЕЗ 10 СЕКУНД ===');
  if (!hasReward && isGameActive) {
    console.log('Создаю 3 тестовых персонажа...');
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        console.log(`Тестовый персонаж ${i+1}`);
        createGameCharacter();
      }, i * 1000);
    }
  }
}, 10000);
