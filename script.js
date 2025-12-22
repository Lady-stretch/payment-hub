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
let characterCounter = 0; // Счетчик всех персонажей

// Кликабельные персонажи (каждый 3-й будет кликабельным)
const CLICKABLE_CHARACTERS = ['⛄', '🎅', '🎁', '🦌', '🌟'];
const NON_CLICKABLE_CHARACTERS = ['❄', '✨', '🥶', '🧊', '🍂']; // Некликабельные
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
  
  // Загружаем сохраненные данные
  loadSavedData();
  
  // Создаем эффекты
  createStars();
  startDecorativeSnow(); // Снег сразу
  
  // Запускаем таймер
  updateTimer();
  setInterval(updateTimer, 1000);
  
  // Настраиваем обработчики событий
  setupEventListeners();
  
  // Запускаем игровых персонажей (НЕЗАВИСИМО ОТ ТЕМЫ!)
  startCharacterGame();
  
  // Показываем счетчик
  updateCharacterCounter();
  
  console.log('✅ Инициализация завершена. Игра активна:', isGameActive);
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
    el.style.fontSize = '2.2rem';
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
// ДЕКОРАТИВНЫЙ СНЕГ (ПОСТОЯННО, В ОБЕИХ ТЕМАХ)
// ======================
function createDecorativeSnowflake() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  
  // Позиция
  snowflake.style.left = Math.random() * 100 + 'vw';
  
  // Случайный размер
  const size = Math.random() * 1.2 + 0.8;
  snowflake.style.fontSize = size + 'em';
  
  // Цвет зависит от темы
  if (isLightTheme) {
    snowflake.style.color = 'rgba(74, 111, 165, 0.7)'; // Синий для светлой темы
  } else {
    snowflake.style.color = 'rgba(180, 220, 255, 0.8)'; // Светло-голубой для темной
  }
  
  // Анимация
  const duration = Math.random() * 8 + 5; // 5-13 секунд
  snowflake.style.animation = `fall ${duration}s linear infinite`;
  snowflake.style.opacity = Math.random() * 0.6 + 0.4;
  
  snowflake.innerHTML = ['❄', '•', '✻', '❉', '❅'][Math.floor(Math.random() * 5)];
  
  snowContainer.appendChild(snowflake);
  
  // Автоудаление
  setTimeout(() => {
    if (snowflake.parentNode) {
      snowflake.remove();
    }
  }, duration * 1000);
}

function startDecorativeSnow() {
  // Создаем много снежинок сразу
  for (let i = 0; i < 40; i++) {
    setTimeout(() => createDecorativeSnowflake(), i * 100);
  }
  
  // Продолжаем создавать постоянно
  decorativeSnowInterval = setInterval(() => {
    createDecorativeSnowflake();
  }, 500); // Каждые 500 мс = постоянно
}

// ======================
// ИГРА: ПЕРСОНАЖИ (РАБОТАЕТ В ОБЕИХ ТЕМАХ!)
// ======================

// СОЗДАНИЕ ПЕРСОНАЖА
function createGameCharacter() {
  if (hasReward || !isGameActive) {
    return;
  }
  
  characterCounter++;
  const isClickable = (characterCounter % 3 === 0); // Каждый 3-й кликабельный
  
  // Выбираем эмодзи
  const characterArray = isClickable ? CLICKABLE_CHARACTERS : NON_CLICKABLE_CHARACTERS;
  const characterEmoji = characterArray[Math.floor(Math.random() * characterArray.length)];
  const characterName = CHARACTER_NAMES[characterEmoji];
  
  const characterElement = document.createElement('div');
  characterElement.className = `new-year-character ${isClickable ? 'clickable' : 'non-clickable'}`;
  characterElement.innerHTML = `
    ${characterEmoji}
    <div class="character-tooltip">${isClickable ? 'Кликни!' : 'Мимо!'} ${characterName}</div>
  `;
  
  // Позиция (не слишком близко к краям)
  characterElement.style.left = Math.random() * 80 + 10 + 'vw';
  
  // Размер
  const size = Math.random() * 20 + 35;
  characterElement.style.fontSize = size + 'px';
  characterElement.style.zIndex = '1000';
  
  // Цвет для светлой темы
  if (isLightTheme) {
    characterElement.style.filter = 'brightness(0.9)';
  }
  
  // Данные
  characterElement.dataset.emoji = characterEmoji;
  characterElement.dataset.name = characterName;
  characterElement.dataset.clickable = isClickable.toString();
  
  // Анимация падения
  const duration = Math.random() * 10 + 15; // 15-25 секунд
  characterElement.style.animation = `character-fall ${duration}s linear forwards`;
  
  // Клик по персонажу
  characterElement.addEventListener('click', function(event) {
    handleCharacterClick(event);
  });
  
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

// ОБРАБОТКА КЛИКА ПО ПЕРСОНАЖУ
function handleCharacterClick(event) {
  if (hasReward) return;
  
  const character = event.currentTarget;
  const isClickable = character.dataset.clickable === 'true';
  const emoji = character.dataset.emoji;
  const name = character.dataset.name;
  
  // Координаты для эффекта
  const rect = character.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  // Анимация исчезновения
  character.style.transform = 'scale(0)';
  character.style.transition = 'transform 0.3s ease';
  
  if (isClickable) {
    // КЛИКАБЕЛЬНЫЙ: поздравление и очки
    createClickEffect(x, y, '🎉 С Новым Годом!', '#FFD700');
    
    // Увеличиваем счет
    caughtCharacters++;
    localStorage.setItem('charactersCaught', caughtCharacters.toString());
    
    // Обновляем счетчик
    updateCharacterCounter();
    
    // Проверяем прогресс
    checkProgress();
    checkForReward();
    
    console.log(`✅ Пойман кликабельный персонаж: ${name}! Всего: ${caughtCharacters}`);
  } else {
    // НЕКЛИКАБЕЛЬНЫЙ: промах
    createClickEffect(x, y, '❌ Промах!', '#ff4444');
    console.log(`❌ Промах по некликабельному персонажу: ${name}`);
  }
  
  // Удаляем персонаж
  setTimeout(() => {
    if (character.parentNode) {
      character.remove();
    }
  }, 300);
}

// ЭФФЕКТ ПРИ КЛИКЕ
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
  
  // Анимация
  setTimeout(() => {
    effect.style.transform = 'translateY(-30px)';
    effect.style.opacity = '0';
  }, 100);
  
  setTimeout(() => {
    if (effect.parentNode) {
      effect.remove();
    }
  }, 1000);
}

// ЗАПУСК ИГРЫ С ПЕРСОНАЖАМИ (РАБОТАЕТ ВСЕГДА!)
function startCharacterGame() {
  if (hasReward) {
    console.log('Игра не запущена: уже есть награда');
    return;
  }
  
  console.log('🎮 Запуск новогодней игры...');
  isGameActive = true;
  
  // Первый персонаж через 2 секунды
  setTimeout(() => {
    createGameCharacter();
  }, 2000);
  
  // Затем каждые 3-5 секунд
  characterInterval = setInterval(() => {
    if (isGameActive && !hasReward) {
      createGameCharacter();
    }
  }, 3000 + Math.random() * 2000); // 3-5 секунд
  
  console.log('✅ Игра запущена, персонажи будут падать каждые 3-5 секунд');
}

// ОСТАНОВКА ИГРЫ
function stopCharacterGame() {
  console.log('Остановка игры');
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
    if (caughtCharacters > 0) {
      counter.style.display = 'block';
      countSpan.textContent = caughtCharacters;
      
      if (hasReward) {
        counter.innerHTML = '🎉 Все подарки получены! 🎁';
        counter.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
        counter.style.color = 'white';
      }
    } else {
      counter.style.display = 'block';
      countSpan.textContent = '0';
    }
  }
}

// ======================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (ИГРА ПРОДОЛЖАЕТ РАБОТАТЬ!)
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
  
  // Очищаем снег и создаем заново (с правильным цветом)
  clearInterval(decorativeSnowInterval);
  const snowContainer = document.querySelector('.snow-container');
  if (snowContainer) snowContainer.innerHTML = '';
  startDecorativeSnow();
  
  // Звезды только для темной темы
  const starsContainer = document.querySelector('.stars-container');
  if (starsContainer) starsContainer.innerHTML = '';
  if (!isLightTheme) {
    createStars();
  }
  
  console.log(isLightTheme ? '☀️ Светлая тема' : '🌙 Темная тема');
  
  // Игра ПРОДОЛЖАЕТ работать в обеих темах!
  updateCharacterCounter();
}

// ======================
// ЛОГИКА ВЫБОРА ПАКЕТОВ
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
// ЗВЁЗДЫ (ТОЛЬКО ДЛЯ ТЕМНОЙ ТЕМЫ)
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
  
  console.log('Загружены данные:', {isLightTheme, caughtCharacters, hasReward});
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
    isGameActive = false;
    if (characterInterval) {
      clearInterval(characterInterval);
      characterInterval = null;
    }
  } else if (!hasReward) {
    isGameActive = true;
    if (!characterInterval) {
      startCharacterGame();
    }
  }
});
