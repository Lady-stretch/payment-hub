// ======================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ======================
let currentInstallment = null;
let caughtCharacters = 0;
const CHARACTERS_FOR_REWARD = 10; // Изменили с 5 на 10
let hasReward = false;
let isLightTheme = false;
let decorativeSnowInterval;
let characterInterval;
let isGameActive = false;

// Кликабельные персонажи (5 видов)
const CLICKABLE_CHARACTERS = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const CHARACTER_NAMES = {
  '⛄': 'Снеговик',
  '🎅': 'Дед Мороз', 
  '🎁': 'Подарок',
  '🦌': 'Олень',
  '🌟': 'Звезда'
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
  
  // Загружаем сохраненные данные
  loadSavedData();
  
  // Создаем эффекты
  createStars();
  startDecorativeSnow(); // Декоративный снег каждые 2 сек
  
  // Запускаем таймер
  updateTimer();
  setInterval(updateTimer, 1000);
  
  // Настраиваем обработчики событий
  setupEventListeners();
  
  // Запускаем игровых персонажей (только в темной теме)
  if (!isLightTheme && !hasReward) {
    startCharacterGame();
  }
  
  // Показываем счетчик если уже ловили персонажей
  updateCharacterCounter();
  
  console.log('✅ Инициализация завершена');
});

// ======================
// ТАЙМЕР ДО НОВОГО ГОДА (УЛУЧШЕННЫЙ)
// ======================
const END_DATE = new Date('January 1, 2026 00:00:00 GMT+0300');

function updateTimer() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;

  const diff = END_DATE - Date.now();
  
  if (diff <= 0) {
    el.innerHTML = '<span style="color: var(--green)">С НОВЫМ ГОДОМ! 🎄</span>';
    el.style.fontSize = '2.2rem';
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  const format = (num) => num < 10 ? '0' + num : num;
  
  // Адаптивный таймер для мобильных
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
    el.style.fontSize = '1rem';
  } else {
    el.innerHTML = `
      <span style="display: inline-flex; align-items: baseline;">
        ${format(d)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">д</span>
      </span>
      <span style="margin:0 3px; color: var(--snow-color);">:</span>
      <span style="display: inline-flex; align-items: baseline;">
        ${format(h)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">ч</span>
      </span>
      <span style="margin:0 3px; color: var(--snow-color);">:</span>
      <span style="display: inline-flex; align-items: baseline;">
        ${format(m)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">м</span>
      </span>
      <span style="margin:0 3px; color: var(--snow-color);">:</span>
      <span style="display: inline-flex; align-items: center;">
        ${format(s)}<span style="font-size:0.7em; margin:0 3px; color: var(--snow-color);">с</span>
      </span>
    `;
    el.style.fontSize = '2.5rem';
  }
}

// ======================
// ДЕКОРАТИВНЫЙ СНЕГ (каждые 2 секунды)
// ======================
function createDecorativeSnowflake() {
  if (!document.querySelector('.snow-container')) return;
  
  const snowContainer = document.querySelector('.snow-container');
  const snowflake = document.createElement('div');
  // УБЕРИТЕ КЛАСС snowflake или оставьте, но проверьте CSS
  // snowflake.classList.add('snowflake'); // ← ЗАКОММЕНТИРУЙТЕ ЭТУ СТРОКУ
  
  snowflake.innerHTML = ['❄', '•', '✻'][Math.floor(Math.random() * 3)];
  
  // Позиция
  snowflake.style.position = 'absolute';
  snowflake.style.top = '-10px';
  snowflake.style.left = Math.random() * 100 + 'vw';
  snowflake.style.fontSize = (Math.random() * 1.2 + 0.8) + 'em';
  snowflake.style.color = 'rgba(180, 220, 255, 0.8)';
  snowflake.style.zIndex = '1';
  snowflake.style.pointerEvents = 'none';
  snowflake.style.userSelect = 'none';
  
  // Анимация
  const duration = Math.random() * 8 + 6;
  snowflake.style.animation = `fall ${duration}s linear infinite`;
  snowflake.style.animationDelay = Math.random() * 2 + 's';
  snowflake.style.opacity = Math.random() * 0.5 + 0.3;
  
  snowContainer.appendChild(snowflake);
  
  // Автоудаление
  setTimeout(() => {
    if (snowflake.parentNode) {
      snowflake.remove();
    }
  }, duration * 1000);
}
  snowflake.innerHTML = ['❄', '•', '✻'][Math.floor(Math.random() * 3)];
  
  // Позиция
  snowflake.style.left = Math.random() * 100 + 'vw';
  
  // Случайный размер и скорость
  const size = Math.random() * 1.2 + 0.8;
  const duration = Math.random() * 8 + 6; // 6-14 секунд
  const delay = Math.random() * 2;
  
  snowflake.style.fontSize = size + 'em';
  snowflake.style.animationDuration = duration + 's';
  snowflake.style.animationDelay = delay + 's';
  snowflake.style.opacity = Math.random() * 0.5 + 0.3;
  snowflake.style.zIndex = '1';
  snowflake.style.pointerEvents = 'none';
  
  snowContainer.appendChild(snowflake);
  
  // Автоудаление
  setTimeout(() => {
    if (snowflake.parentNode) {
      snowflake.remove();
    }
  }, duration * 1000);
}

function startDecorativeSnow() {
  // Создаем сразу несколько снежинок
  for (let i = 0; i < 20; i++) {
    setTimeout(() => createDecorativeSnowflake(), i * 200);
  }
  
  // Продолжаем создавать каждые 2 секунды
  decorativeSnowInterval = setInterval(() => {
    if (document.hasFocus()) { // Только если страница активна
      createDecorativeSnowflake();
    }
  }, 2000);
}

// ======================
// ИГРОВЫЕ ПЕРСОНАЖИ (каждые 15 секунд)
// ======================
function createClickableCharacter() {
  if (hasReward || isLightTheme || !isGameActive) return;
  
  const characterEmoji = CLICKABLE_CHARACTERS[Math.floor(Math.random() * CLICKABLE_CHARACTERS.length)];
  const characterName = CHARACTER_NAMES[characterEmoji];
  
  const characterElement = document.createElement('div');
  characterElement.className = 'new-year-character';
  characterElement.innerHTML = `
    ${characterEmoji}
    <div class="character-tooltip">Кликни! ${characterName}</div>
  `;
  
  // Позиция
  characterElement.style.left = Math.random() * 85 + 5 + 'vw';
  
  // Случайный размер (35-55px)
  characterElement.style.fontSize = (Math.random() * 20 + 35) + 'px';
  
  // Данные персонажа
  characterElement.dataset.emoji = characterEmoji;
  characterElement.dataset.name = characterName;
  
  // Анимация падения (15-25 секунд)
  const duration = Math.random() * 10 + 15;
  characterElement.style.animation = `character-fall ${duration}s linear forwards`;
  
  // Клик по персонажу
  characterElement.addEventListener('click', catchCharacter);
  
  // Добавляем в контейнер снега
  const snowContainer = document.querySelector('.snow-container');
  if (snowContainer) {
    snowContainer.appendChild(characterElement);
  }
  
  // Автоматическое удаление после падения
  setTimeout(() => {
    if (characterElement.parentNode) {
      characterElement.remove();
    }
  }, duration * 1000);
}

function startCharacterGame() {
  if (hasReward || isLightTheme) return;
  
  console.log('🎮 Запуск новогодней игры...');
  isGameActive = true; // ← ПЕРЕД setTimeout!
  
  // Сразу создаем первого персонажа для тестирования
  setTimeout(() => {
    createClickableCharacter();
  }, 1000); // ← Уменьшил до 1 секунды для теста
  
  // Затем каждые 15-20 секунд
  characterInterval = setInterval(() => {
    if (isGameActive && !hasReward && !isLightTheme && document.hasFocus()) {
      createClickableCharacter();
    }
  }, 15000 + Math.random() * 5000);
}
  
  // Затем каждые 15-20 секунд
  characterInterval = setInterval(() => {
    if (isGameActive && !hasReward && !isLightTheme && document.hasFocus()) {
      createClickableCharacter();
    }
  }, 15000 + Math.random() * 5000); // 15-20 секунд
}

function stopCharacterGame() {
  isGameActive = false;
  if (characterInterval) {
    clearInterval(characterInterval);
    characterInterval = null;
  }
  
  // Удаляем всех персонажей
  document.querySelectorAll('.new-year-character').forEach(char => {
    char.remove();
  });
}

function catchCharacter(event) {
  if (hasReward || isLightTheme) return;
  
  const character = event.currentTarget;
  const emoji = character.dataset.emoji;
  const name = character.dataset.name;
  
  // Координаты для анимации
  const rect = character.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  // Анимация исчезновения
  character.style.transform = 'scale(0)';
  character.style.transition = 'transform 0.3s ease';
  
  // Увеличиваем счет
  caughtCharacters++;
  localStorage.setItem('charactersCaught', caughtCharacters.toString());
  
  // Создаем эффект "+1"
  createCatchEffect(x, y, emoji);
  
  // Обновляем счетчик
  updateCharacterCounter();
  
  // Проверяем прогресс и показываем уведомления
  checkProgress();
  
  // Проверяем награду
  checkForReward();
  
  // Удаляем персонаж
  setTimeout(() => {
    if (character.parentNode) {
      character.remove();
    }
  }, 300);
  
  console.log(`🎯 Пойман ${name}! Всего: ${caughtCharacters}`);
}

function createCatchEffect(x, y, emoji) {
  const effect = document.createElement('div');
  effect.className = 'catch-effect';
  effect.innerHTML = `${emoji} +1`;
  effect.style.left = (x - 20) + 'px';
  effect.style.top = (y - 20) + 'px';
  effect.style.color = '#FFD700';
  effect.style.fontWeight = 'bold';
  effect.style.zIndex = '10000';
  
  document.body.appendChild(effect);
  
  setTimeout(() => effect.remove(), 1000);
}

// ======================
// СИСТЕМА УВЕДОМЛЕНИЙ И НАГРАД
// ======================
function showProgressNotification(message) {
  const notification = document.getElementById('progress-notification');
  if (!notification) return;
  
  notification.innerHTML = message;
  notification.style.display = 'block';
  notification.style.animation = 'slideDown 0.3s ease, progressPulse 2s infinite';
  
  // Автоскрытие через 3 секунды
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function checkProgress() {
  // Показываем сообщения на определённых этапах
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
    
    // Останавливаем игру
    stopCharacterGame();
    
    console.log('🎁 Все 10 подарков собраны! Игра завершена.');
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
  
  // Автоудаление через 15 секунд
  setTimeout(() => {
    if (rewardElement.parentNode) {
      rewardElement.remove();
    }
  }, 15000);
}

function updateCharacterCounter() {
  const counter = document.getElementById('character-counter');
  const countSpan = document.getElementById('character-count');
  
  if (counter && countSpan) {
    if (caughtCharacters > 0 && !isLightTheme) {
      counter.style.display = 'block';
      countSpan.textContent = caughtCharacters;
      
      // Если награда получена
      if (hasReward) {
        counter.innerHTML = '🎉 Все подарки получены! 🎁';
        counter.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
        counter.style.color = 'white';
      }
    } else if (!isLightTheme && !hasReward) {
      // Показываем всегда в темной теме, даже если 0
      counter.style.display = 'block';
      countSpan.textContent = '0';
    } else {
      counter.style.display = 'none';
    }
  }
}

// ======================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ======================
function setupEventListeners() {
  // Кнопка темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Выбор пакетов
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('select')) {
        selectPackage.call(this);
        return;
      }
      
      if (e.target === this || e.target.closest('.desc') || e.target.closest('.price')) {
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
  
  // Кнопка назад
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }
}

function toggleTheme() {
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  
  // Очищаем снег и создаем заново
  clearInterval(decorativeSnowInterval);
  document.querySelector('.snow-container').innerHTML = '';
  
  // Перезапускаем декоративный снег
  startDecorativeSnow();
  
  // Управляем игрой
  if (isLightTheme) {
    // В светлой теме останавливаем игру
    stopCharacterGame();
    console.log('☀️ Переключено на светлую тему, игра остановлена');
  } else {
    // В тёмной теме создаём звёзды и запускаем игру
    createStars();
    if (!hasReward) {
      startCharacterGame();
    }
    console.log('🌙 Переключено на темную тему, игра запущена');
  }
  
  updateCharacterCounter();
}

// ======================
// ЛОГИКА ВЫБОРА ПАКЕТОВ (без изменений)
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
  document.getElementById('selected-price').textContent = 
    Number(price).toLocaleString('ru-RU');

  const installmentBtn = document.getElementById('installment-btn');
  const installments = this.getAttribute('data-installments');
  
  if (installments && installments !== 'Нет' && installments !== 'null' && installments !== 'undefined') {
    currentInstallment = this.getAttribute('data-link');
    document.getElementById('months').textContent = installments + ' мес';
    installmentBtn.style.display = 'block';
  } else {
    installmentBtn.style.display = 'none';
  }

  paymentSection.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
}

function openInstallment() {
  if (currentInstallment) {
    window.open(currentInstallment, '_blank');
  }
}

function goBack() {
  const paymentSection = document.getElementById('payment');
  paymentSection.style.display = 'none';
  
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
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  starsContainer.innerHTML = '';
  
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    const starSize = Math.random() * 2 + 1;
    star.style.width = starSize + 'px';
    star.style.height = starSize + 'px';
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
  if (savedCharacters) {
    caughtCharacters = parseInt(savedCharacters);
  }
  
  const savedReward = localStorage.getItem('characterReward');
  if (savedReward === 'true') {
    hasReward = true;
  }
}

// ======================
// АДАПТАЦИЯ ПРИ ИЗМЕНЕНИИ РАЗМЕРА
// ======================
window.addEventListener('resize', updateTimer);

// ======================
// ПАУЗА ИГРЫ ПРИ НЕАКТИВНОЙ ВКЛАДКЕ
// ======================
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Вкладка неактивна
    isGameActive = false;
  } else if (!isLightTheme && !hasReward) {
    // Вкладка снова активна, перезапускаем игру
    isGameActive = true;
    startCharacterGame();
  }
});
