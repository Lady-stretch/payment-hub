// ===========================================
// LADY STRETCH - ГЛАВНЫЙ СКРИПТ
// ===========================================

// Конфигурация
const CONFIG = {
  charactersForReward: 5,
  newYearDate: new Date('January 1, 2026 00:00:00 GMT+0300'),
  
  // Персонажи для тёмной темы
  darkThemeCharacters: [
    { emoji: '⛄', name: 'Снеговик', color: '#4FC3F7' },
    { emoji: '🎅', name: 'Дед Мороз', color: '#F44336' },
    { emoji: '🎁', name: 'Подарок', color: '#FF9800' },
    { emoji: '🦌', name: 'Олень', color: '#8D6E63' },
    { emoji: '🌟', name: 'Звезда', color: '#FFD600' }
  ],
  
  // Персонажи для светлой темы
  lightThemeCharacters: [
    { emoji: '❄️', name: 'Снежинка', color: '#4A6FA5' },
    { emoji: '🎄', name: 'Ёлочка', color: '#388E3C' },
    { emoji: '🎀', name: 'Бант', color: '#E91E63' },
    { emoji: '🧣', name: 'Шарф', color: '#FF5722' },
    { emoji: '🎊', name: 'Хлопушка', color: '#9C27B0' }
  ],
  
  // Новогодние пожелания
  wishes: [
    "Пусть Новый год принесёт здоровье и радость!",
    "Желаем лёгкости в каждом движении!",
    "Пусть каждый день будет наполнен энергией!",
    "Желаем гармонии души и тела!",
    "Пусть мечты сбываются, а цели достигаются!"
  ]
};

// Состояние приложения
const STATE = {
  caughtCharacters: 0,
  hasReward: false,
  isLightTheme: false,
  currentInstallment: null,
  characterInterval: null,
  snowInterval: null,
  starsInterval: null
};

// ===========================================
// ИНИЦИАЛИЗАЦИЯ
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Lady Stretch • Новогодняя версия 2025');
  
  initApp();
});

function initApp() {
  loadSavedData();
  setupEventListeners();
  createSnowEffect();
  updateTimer();
  startCharacterGame();
  
  // Обновляем таймер каждую секунду
  setInterval(updateTimer, 1000);
  
  console.log('Приложение инициализировано');
}

// ===========================================
// ЗАГРУЗКА ДАННЫХ
// ===========================================
function loadSavedData() {
  // Тема
  const savedTheme = localStorage.getItem('theme');
  STATE.isLightTheme = savedTheme === 'light';
  
  if (STATE.isLightTheme) {
    document.body.classList.add('light-theme');
  }
  
  // Прогресс игры
  const savedProgress = localStorage.getItem('gameProgress');
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    STATE.caughtCharacters = progress.caughtCharacters || 0;
    STATE.hasReward = progress.hasReward || false;
  }
  
  // Обновляем UI
  updateCharacterCounter();
  
  console.log('Данные загружены:', {
    theme: STATE.isLightTheme ? 'light' : 'dark',
    characters: STATE.caughtCharacters,
    hasReward: STATE.hasReward
  });
}

function saveGameProgress() {
  const progress = {
    caughtCharacters: STATE.caughtCharacters,
    hasReward: STATE.hasReward,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem('gameProgress', JSON.stringify(progress));
}

// ===========================================
// СНЕГОПАД И ЭФФЕКТЫ
// ===========================================
function createSnowEffect() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  snowContainer.innerHTML = '';
  
  const snowflakes = ['❄', '•', '✻', '❉', '✾'];
  const count = STATE.isLightTheme ? 60 : 80; // Меньше снега в светлой теме
  
  for (let i = 0; i < count; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    
    // Позиция
    flake.style.left = `${Math.random() * 100}vw`;
    
    // Размер и анимация
    const size = Math.random() * 1.2 + 0.8;
    const duration = Math.random() * 8 + 8;
    const delay = Math.random() * 5;
    
    flake.style.fontSize = `${size}em`;
    flake.style.opacity = Math.random() * 0.6 + 0.4;
    flake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
    
    snowContainer.appendChild(flake);
  }
  
  // Звёзды только в тёмной теме
  if (!STATE.isLightTheme) {
    createStars();
  }
}

function createStars() {
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  starsContainer.innerHTML = '';
  
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    star.style.opacity = Math.random() * 0.6 + 0.2;
    star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    
    starsContainer.appendChild(star);
  }
}

// ===========================================
// НОВОГОДНЯЯ ИГРА
// ===========================================
function startCharacterGame() {
  if (STATE.hasReward) {
    console.log('Награда уже получена, игра остановлена');
    return;
  }
  
  // Очищаем предыдущий интервал
  if (STATE.characterInterval) {
    clearInterval(STATE.characterInterval);
  }
  
  // Запускаем создание персонажей
  createCharacter();
  
  // Интервал: каждые 15-25 секунд
  STATE.characterInterval = setInterval(() => {
    if (!STATE.hasReward && Math.random() > 0.4) {
      createCharacter();
    }
  }, 15000 + Math.random() * 10000);
  
  console.log('Игра запущена');
}

function createCharacter() {
  const characters = STATE.isLightTheme 
    ? CONFIG.lightThemeCharacters 
    : CONFIG.darkThemeCharacters;
  
  const character = characters[Math.floor(Math.random() * characters.length)];
  
  const element = document.createElement('div');
  element.className = 'game-character';
  element.innerHTML = character.emoji;
  element.dataset.name = character.name;
  
  // Стили
  element.style.position = 'fixed';
  element.style.top = '-60px';
  element.style.left = `${Math.random() * 85 + 7.5}vw`;
  element.style.fontSize = `${Math.random() * 30 + 40}px`;
  element.style.zIndex = '999';
  element.style.cursor = 'pointer';
  element.style.userSelect = 'none';
  element.style.textShadow = `0 2px 10px ${character.color}40`;
  element.style.opacity = '0.9';
  element.style.transition = 'transform 0.2s, opacity 0.3s';
  
  // Анимация падения
  const duration = Math.random() * 12 + 10;
  element.style.animation = `characterFall ${duration}s linear forwards`;
  
  // Обработчик клика
  element.addEventListener('click', (e) => catchCharacter(e, character));
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'scale(1.15)';
    element.style.opacity = '1';
  });
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '0.9';
  });
  
  document.body.appendChild(element);
  
  // Автоматическое удаление после падения
  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, duration * 1000);
}

function catchCharacter(event, character) {
  if (STATE.hasReward) return;
  
  const element = event.target;
  
  // Анимация исчезновения
  element.style.animation = 'none';
  element.style.transform = 'scale(1.5) rotate(360deg)';
  element.style.opacity = '0';
  element.style.transition = 'all 0.5s ease';
  
  // Увеличиваем счётчик
  STATE.caughtCharacters++;
  saveGameProgress();
  
  // Создаём эффект
  createCatchEffect(event.clientX, event.clientY, character.emoji);
  
  // Показываем сообщение
  showCharacterMessage(character);
  
  // Обновляем UI
  updateCharacterCounter();
  
  // Проверяем награду
  checkForReward();
  
  // Удаляем элемент
  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, 500);
  
  console.log(`Пойман: ${character.name} (${STATE.caughtCharacters}/5)`);
}

function createCatchEffect(x, y, emoji) {
  const effect = document.createElement('div');
  effect.className = 'catch-effect';
  effect.textContent = `+1 ${emoji}`;
  effect.style.position = 'fixed';
  effect.style.left = `${x - 20}px`;
  effect.style.top = `${y - 20}px`;
  effect.style.fontSize = '24px';
  effect.style.fontWeight = 'bold';
  effect.style.color = '#FFD700';
  effect.style.zIndex = '10000';
  effect.style.pointerEvents = 'none';
  effect.style.textShadow = '0 2px 10px rgba(0,0,0,0.5)';
  effect.style.animation = 'floatUp 1s ease-out forwards';
  
  document.body.appendChild(effect);
  
  setTimeout(() => effect.remove(), 1000);
}

function showCharacterMessage(character) {
  const wish = CONFIG.wishes[Math.floor(Math.random() * CONFIG.wishes.length)];
  
  const message = document.createElement('div');
  message.className = 'character-message';
  message.innerHTML = `
    <div class="message-content">
      <div class="message-emoji">${character.emoji}</div>
      <div class="message-text">
        <strong>${character.name}</strong><br>
        <em>${wish}</em>
      </div>
    </div>
  `;
  
  message.style.position = 'fixed';
  message.style.bottom = '20px';
  message.style.right = '20px';
  message.style.background = 'var(--bg-card)';
  message.style.border = '1px solid var(--border-light)';
  message.style.borderRadius = '12px';
  message.style.padding = '12px';
  message.style.boxShadow = 'var(--shadow-md)';
  message.style.zIndex = '9999';
  message.style.animation = 'slideIn 0.3s ease';
  message.style.backdropFilter = 'blur(10px)';
  
  document.body.appendChild(message);
  
  // Автоудаление через 4 секунды
  setTimeout(() => {
    message.style.opacity = '0';
    message.style.transform = 'translateY(20px)';
    message.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      if (message.parentNode) message.remove();
    }, 300);
  }, 4000);
}

function updateCharacterCounter() {
  const counter = document.getElementById('character-counter');
  const countElement = document.getElementById('character-count');
  
  if (!counter || !countElement) return;
  
  countElement.textContent = STATE.caughtCharacters;
  
  if (STATE.caughtCharacters > 0 && !STATE.hasReward) {
    counter.style.display = 'flex';
  } else if (STATE.hasReward) {
    counter.innerHTML = `
      <div class="counter-emoji">🎉</div>
      <div class="counter-text">
        <div><strong>Подарок получен!</strong></div>
        <div class="counter-hint">1 бесплатное занятие</div>
      </div>
    `;
    counter.style.display = 'flex';
    counter.style.background = 'var(--gradient-green)';
  } else {
    counter.style.display = 'none';
  }
}

function checkForReward() {
  if (STATE.caughtCharacters >= CONFIG.charactersForReward && !STATE.hasReward) {
    STATE.hasReward = true;
    saveGameProgress();
    showRewardNotification();
    
    // Останавливаем игру
    if (STATE.characterInterval) {
      clearInterval(STATE.characterInterval);
    }
    
    // Удаляем всех персонажей
    document.querySelectorAll('.game-character').forEach(el => el.remove());
    
    console.log('Награда получена!');
  }
}

function showRewardNotification() {
  const notification = document.createElement('div');
  notification.className = 'reward-notification';
  notification.innerHTML = `
    <div class="reward-content">
      <div class="reward-emoji">🎉</div>
      <div class="reward-text">
        <h3>Поздравляем!</h3>
        <p>Вы собрали 5 новогодних персонажей!</p>
        <p><strong>Ваш подарок: 1 БЕСПЛАТНОЕ занятие</strong></p>
        <p class="reward-code">Промокод: <code>NEWYEAR2025</code></p>
        <p class="reward-hint">Покажите этот код администратору при покупке абонемента</p>
      </div>
      <button class="reward-close">✕</button>
    </div>
  `;
  
  notification.style.position = 'fixed';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.background = 'var(--bg-card)';
  notification.style.border = '2px solid var(--accent-red)';
  notification.style.borderRadius = '20px';
  notification.style.padding = '30px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = 'var(--shadow-lg)';
  notification.style.maxWidth = '500px';
  notification.style.width = '90%';
  notification.style.backdropFilter = 'blur(20px)';
  notification.style.animation = 'popup 0.5s ease';
  
  // Кнопка закрытия
  const closeBtn = notification.querySelector('.reward-close');
  closeBtn.addEventListener('click', () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => notification.remove(), 300);
  });
  
  document.body.appendChild(notification);
  
  // Автоскрытие через 10 секунд
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

// ===========================================
// ТАЙМЕР
// ===========================================
function updateTimer() {
  const timerElement = document.getElementById('countdown-timer');
  if (!timerElement) return;
  
  const now = new Date();
  const diff = CONFIG.newYearDate - now;
  
  if (diff <= 0) {
    timerElement.textContent = 'С НОВЫМ ГОДОМ!';
    timerElement.style.color = 'var(--accent-red)';
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  const format = (num) => num.toString().padStart(2, '0');
  
  timerElement.innerHTML = `
    <span class="timer-part">${format(days)}<span class="timer-label">д</span></span>
    <span class="timer-separator">:</span>
    <span class="timer-part">${format(hours)}<span class="timer-label">ч</span></span>
    <span class="timer-separator">:</span>
    <span class="timer-part">${format(minutes)}<span class="timer-label">м</span></span>
    <span class="timer-separator">:</span>
    <span class="timer-part">${format(seconds)}<span class="timer-label">с</span></span>
  `;
}

// ===========================================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ===========================================
function setupEventListeners() {
  // Кнопка темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Карточки абонементов
  document.querySelectorAll('.card').forEach(card => {
    const selectBtn = card.querySelector('.select');
    if (selectBtn) {
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPackage(card);
      });
    }
    
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('select')) return;
      selectPackage(card);
    });
  });
  
  // Рассрочка
  const installmentBtn = document.getElementById('installment-btn');
  if (installmentBtn) {
    installmentBtn.addEventListener('click', openInstallment);
  }
  
  // Кнопка назад
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }
}

function toggleTheme() {
  STATE.isLightTheme = !STATE.isLightTheme;
  document.body.classList.toggle('light-theme', STATE.isLightTheme);
  
  // Сохраняем выбор
  localStorage.setItem('theme', STATE.isLightTheme ? 'light' : 'dark');
  
  // Обновляем эффекты
  createSnowEffect();
  
  // Перезапускаем игру с новыми персонажами
  if (!STATE.hasReward) {
    // Удаляем старых персонажей
    document.querySelectorAll('.game-character').forEach(el => el.remove());
    
    // Перезапускаем игру
    startCharacterGame();
  }
  
  console.log('Тема изменена:', STATE.isLightTheme ? 'light' : 'dark');
}

// ===========================================
// ВЫБОР АБОНЕМЕНТА И ОПЛАТА
// ===========================================
function selectPackage(card) {
  // Сбрасываем выделение
  document.querySelectorAll('.card').forEach(c => {
    c.style.border = '';
  });
  
  // Выделяем выбранную карточку
  card.style.border = '2px solid var(--accent-blue)';
  
  // Показываем блок оплаты
  const paymentSection = document.getElementById('payment');
  if (paymentSection) {
    paymentSection.style.display = 'block';
    
    // Устанавливаем цену
    const price = card.dataset.price;
    const priceElement = document.getElementById('selected-price');
    if (priceElement) {
      priceElement.textContent = Number(price).toLocaleString('ru-RU');
    }
    
    // Рассрочка
    const installmentBtn = document.getElementById('installment-btn');
    const installments = card.dataset.installments;
    
    if (installmentBtn) {
      if (installments && installments !== 'Нет') {
        installmentBtn.style.display = 'block';
        document.getElementById('months').textContent = installments;
        STATE.currentInstallment = card.dataset.link;
      } else {
        installmentBtn.style.display = 'none';
      }
    }
    
    // Прокрутка
    paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  console.log('Выбран абонемент:', card.querySelector('h3').textContent);
}

function openInstallment() {
  if (STATE.currentInstallment) {
    window.open(STATE.currentInstallment, '_blank');
  }
}

function goBack() {
  const paymentSection = document.getElementById('payment');
  if (paymentSection) {
    paymentSection.style.display = 'none';
  }
  
  // Сбрасываем выделение
  document.querySelectorAll('.card').forEach(card => {
    card.style.border = '';
  });
  
  // Прокрутка вверх
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================================
// CSS-АНИМАЦИИ (добавляем динамически)
// ===========================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fall {
    0% { transform: translateY(-10px) rotate(0deg); opacity: 0.8; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0.2; }
  }
  
  @keyframes twinkle {
    0% { opacity: 0.2; transform: scale(1); }
    100% { opacity: 0.8; transform: scale(1.1); }
  }
  
  @keyframes characterFall {
    0% { transform: translateY(-60px) rotate(0deg); }
    100% { transform: translateY(100vh) rotate(360deg); }
  }
  
  @keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
  }
  
  @keyframes popup {
    0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .timer-part {
    display: inline-flex;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
  }
  
  .timer-label {
    font-size: 0.6em;
    margin-left: 2px;
    opacity: 0.7;
  }
  
  .timer-separator {
    margin: 0 4px;
    opacity: 0.5;
  }
`;

document.head.appendChild(styleSheet);
