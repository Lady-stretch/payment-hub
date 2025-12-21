// ======================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ======================
let currentInstallment = null;
let caughtCharacters = 0;
const CHARACTERS_FOR_REWARD = 5;
let hasReward = false;
let isLightTheme = false;
let characterInterval;

// Новогодние персонажи с пожеланиями
const NEW_YEAR_CHARACTERS = [
  { emoji: '⛄', name: 'Снеговик', message: 'Пусть новый год принесет тепло уюта и семейного счастья!' },
  { emoji: '🎅', name: 'Дед Мороз', message: 'Желаю здоровья, радости и исполнения самых смелых желаний!' },
  { emoji: '🎁', name: 'Подарок', message: 'Пусть каждый день нового года будет наполнен приятными сюрпризами!' },
  { emoji: '🦌', name: 'Олень', message: 'Пусть удача сопровождает вас во всех начинаниях!' },
  { emoji: '🌟', name: 'Звезда', message: 'Пусть ваш путь освещает счастье и успех!' }
];

const NEW_YEAR_WISHES = [
  "С Новым годом! Пусть все мечты сбываются!",
  "Желаем здоровья, счастья и процветания!",
  "Пусть новый год принесет новые возможности!",
  "Желаем радости, уюта и семейного благополучия!",
  "Пусть каждый день будет наполнен вдохновением!"
];

// ======================
// ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница загружена, запускаем инициализацию...');
  
  // Загружаем сохраненные данные
  loadSavedData();
  
  // Создаем эффекты
  createSnow();
  createStars();
  
  // Запускаем таймер
  updateTimer();
  setInterval(updateTimer, 1000);
  
  // Настраиваем обработчики событий
  setupEventListeners();
  
  // Запускаем новогодних персонажей (только в темной теме)
  if (!isLightTheme && !hasReward) {
    startCharacterFall();
  }
  
  // Показываем счетчик если уже ловили персонажей
  updateCharacterCounter();
  
  console.log('Инициализация завершена');
});

// ======================
// ТАЙМЕР ДО НОВОГО ГОДА
// ======================
const END_DATE = new Date('January 1, 2026 00:00:00 GMT+0300');

function updateTimer() {
  const el = document.getElementById('countdown-timer');
  if (!el) {
    console.error('Элемент таймера не найден!');
    return;
  }

  const diff = END_DATE - Date.now();
  
  if (diff <= 0) {
    el.textContent = 'С НОВЫМ ГОДОМ! 🎄';
    el.style.fontSize = '2.2rem';
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  const format = (num) => num < 10 ? '0' + num : num;
  
  el.innerHTML = `
    <span style="display: inline-flex; align-items: baseline;">
      ${format(d)}<span style="font-size:0.7em; margin:0 3px; color: #b81e2b;">д</span>
    </span>
    <span style="margin:0 3px; color: #b81e2b;">:</span>
    <span style="display: inline-flex; align-items: baseline;">
      ${format(h)}<span style="font-size:0.7em; margin:0 3px; color: #b81e2b;">ч</span>
    </span>
    <span style="margin:0 3px; color: #b81e2b;">:</span>
    <span style="display: inline-flex; align-items: baseline;">
      ${format(m)}<span style="font-size:0.7em; margin:0 3px; color: #b81e2b;">м</span>
    </span>
    <span style="margin:0 3px; color: #b81e2b;">:</span>
    <span style="display: inline-flex; align-items: baseline;">
      ${format(s)}<span style="font-size:0.7em; margin:0 3px; color: #b81e2b;">с</span>
    </span>
  `;
  
  // Адаптивный размер шрифта для мобильных
  const isMobile = window.innerWidth < 768;
  el.style.fontSize = isMobile ? '1.8rem' : '2.5rem';
}

// ======================
// СНЕГОПАД И ЗВЁЗДЫ
// ======================
function createSnow() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) {
    console.error('Контейнер для снега не найден!');
    return;
  }
  
  const snowflakes = ['❄', '•', '✻', '✾', '❉'];
  
  // Очищаем контейнер
  snowContainer.innerHTML = '';
  
  // Меньше снежинок для лёгкости
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    const size = Math.random() * 1.2 + 0.8;
    const duration = Math.random() * 12 + 10; // 10-22 секунды
    const delay = Math.random() * 5;
    
    snowflake.style.fontSize = size + 'em';
    snowflake.style.animationDuration = duration + 's';
    snowflake.style.animationDelay = delay + 's';
    snowflake.style.opacity = Math.random() * 0.6 + 0.3;
    
    snowContainer.appendChild(snowflake);
  }
}

function createStars() {
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) {
    console.error('Контейнер для звезд не найден!');
    return;
  }
  
  // Очищаем контейнер
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
// НОВОГОДНЯЯ ИГРА (с улучшениями)
// ======================
function createNewYearCharacter() {
  if (hasReward || isLightTheme) {
    return;
  }
  
  const characterIndex = Math.floor(Math.random() * NEW_YEAR_CHARACTERS.length);
  const character = NEW_YEAR_CHARACTERS[characterIndex];
  
  const characterElement = document.createElement('div');
  characterElement.className = 'new-year-character';
  characterElement.innerHTML = `
    ${character.emoji}
    <div class="character-tooltip">Кликни для подарка!</div>
  `;
  
  characterElement.style.left = Math.random() * 85 + 5 + 'vw';
  characterElement.style.fontSize = Math.random() * 30 + 40 + 'px';
  characterElement.dataset.name = character.name;
  characterElement.dataset.message = character.message;
  characterElement.dataset.emoji = character.emoji;
  
  const duration = Math.random() * 15 + 25; // 25-40 секунд падение (дольше!)
  characterElement.style.animation = `character-fall ${duration}s linear forwards`;
  
  characterElement.addEventListener('click', catchCharacter);
  
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

function startCharacterFall() {
  if (hasReward || isLightTheme) return;
  
  console.log('Запуск новогодних персонажей...');
  
  // Первый персонаж через 15 секунд
  setTimeout(() => {
    if (!hasReward && !isLightTheme) createNewYearCharacter();
  }, 15000);
  
  // Затем каждые 45-90 секунд (гораздо реже!)
  characterInterval = setInterval(() => {
    if (!hasReward && !isLightTheme && Math.random() > 0.7) {
      createNewYearCharacter();
    }
  }, 45000 + Math.random() * 45000); // 45-90 секунд
}

function removeAllCharacters() {
  document.querySelectorAll('.new-year-character').forEach(character => {
    character.remove();
  });
}

function catchCharacter(event) {
  if (hasReward || isLightTheme) return;
  
  const character = event.currentTarget;
  const name = character.dataset.name;
  const message = character.dataset.message;
  const emoji = character.dataset.emoji;
  
  // Исправляем координаты
  const rect = character.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const x = rect.left + scrollLeft + rect.width / 2;
  const y = rect.top + scrollTop + rect.height / 2;
  
  // Анимация исчезновения
  character.style.transform = 'scale(0)';
  character.style.transition = 'transform 0.3s ease';
  
  // Увеличиваем счет
  caughtCharacters++;
  localStorage.setItem('charactersCaught', caughtCharacters.toString());
  
  // Создаем эффект
  createCatchEffect(x, y, emoji);
  
  // Показываем сообщение персонажа
  showCharacterMessage(name, message, emoji);
  
  // Обновляем счетчик
  updateCharacterCounter();
  
  // Проверяем награду
  checkForReward();
  
  // Удаляем персонажа
  setTimeout(() => {
    if (character.parentNode) {
      character.remove();
    }
  }, 300);
  
  console.log(`Персонаж пойман! Всего: ${caughtCharacters}`);
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
  
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

function showCharacterMessage(name, message, emoji) {
  const messageElement = document.createElement('div');
  messageElement.className = 'gift-notification';
  messageElement.innerHTML = `
    <h3>${emoji} ${name} говорит:</h3>
    <p style="font-style: italic; color: var(--text);">"${message}"</p>
    <p><small>Поймано персонажей: ${caughtCharacters}/${CHARACTERS_FOR_REWARD}</small></p>
    <button onclick="this.parentElement.remove()">Спасибо!</button>
  `;
  
  document.body.appendChild(messageElement);
  
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);
}

// ======================
// СИСТЕМА НАГРАД
// ======================
function updateCharacterCounter() {
  const counter = document.getElementById('character-counter');
  const countSpan = document.getElementById('character-count');
  
  if (caughtCharacters > 0 && !isLightTheme) {
    if (counter) {
      counter.style.display = 'block';
      if (countSpan) {
        countSpan.textContent = caughtCharacters;
      }
      
      // Если награда получена
      if (hasReward) {
        counter.innerHTML = '🎉 Все подарки получены! 🎁';
        counter.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
      }
    }
  } else if (counter) {
    counter.style.display = 'none';
  }
}

function checkForReward() {
  if (!hasReward && caughtCharacters >= CHARACTERS_FOR_REWARD) {
    hasReward = true;
    localStorage.setItem('characterReward', 'true');
    showFinalReward();
    updateCharacterCounter();
    
    // Останавливаем только персонажей, но снег и звёзды продолжаются
    if (characterInterval) {
      clearInterval(characterInterval);
      characterInterval = null;
    }
    
    // Удаляем всех персонажей
    removeAllCharacters();
    
    console.log('Все подарки получены!');
  }
}

function showFinalReward() {
  const randomWish = NEW_YEAR_WISHES[Math.floor(Math.random() * NEW_YEAR_WISHES.length)];
  
  const rewardElement = document.createElement('div');
  rewardElement.className = 'gift-notification';
  rewardElement.innerHTML = `
    <h3>🎉 Поздравляем!</h3>
    <p>Вы поймали всех новогодних персонажей!</p>
    <p><strong>Ваш новогодний подарок:</strong></p>
    <p style="font-size: 1.2rem; color: var(--red); font-weight: 600;">${randomWish}</p>
    <p><small>Покажите этот экран администратору для получения специального новогоднего сюрприза!</small></p>
    <button onclick="this.parentElement.remove()">Спасибо!</button>
  `;
  
  document.body.appendChild(rewardElement);
  
  // Автоудаление через 10 секунд
  setTimeout(() => {
    if (rewardElement.parentNode) {
      rewardElement.remove();
    }
  }, 10000);
}

// ======================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (с игрой в обеих темах)
// ======================
function setupEventListeners() {
  console.log('Настройка обработчиков событий...');
  
  // Кнопка темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    console.log('Кнопка темы подключена');
  } else {
    console.error('Кнопка переключения темы не найдена!');
  }
  
  // Выбор пакетов
  const cards = document.querySelectorAll('.card');
  console.log(`Найдено карточек: ${cards.length}`);
  
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
  console.log('Переключение темы...');
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  
  // Обновляем эффекты
  createSnow();
  
  // Звёзды только в тёмной теме
  if (isLightTheme) {
    // В светлой теме останавливаем персонажей
    if (characterInterval) {
      clearInterval(characterInterval);
      characterInterval = null;
    }
    removeAllCharacters();
    
    // Показываем подсказку для игры
    const counter = document.getElementById('character-counter');
    if (counter) counter.style.display = 'none';
    console.log('Переключено на светлую тему, персонажи остановлены');
  } else {
    // В тёмной теме создаём звёзды и запускаем игру
    createStars();
    
    // Перезапускаем игру только если не получена награда
    if (!hasReward) {
      if (characterInterval) {
        clearInterval(characterInterval);
      }
      removeAllCharacters();
      startCharacterFall();
    }
    
    updateCharacterCounter();
    console.log('Переключено на темную тему, персонажи запущены');
  }
}

function selectPackage() {
  console.log('Выбран пакет:', this.querySelector('h3').textContent);
  
  document.querySelectorAll('.card').forEach(c => {
    c.style.borderColor = '';
    c.style.borderWidth = '';
    c.style.borderStyle = '';
  });
  
  this.style.borderColor = '#4a6fa5';
  this.style.borderWidth = '2px';
  this.style.borderStyle = 'solid';
  
  const paymentSection = document.getElementById('payment');
  if (!paymentSection) {
    console.error('Блок оплаты не найден!');
    return;
  }
  
  paymentSection.style.display = 'block';
  
  const price = this.getAttribute('data-price');
  document.getElementById('selected-price').textContent = 
    Number(price).toLocaleString('ru-RU');

  const installmentBtn = document.getElementById('installment-btn');
  const installments = this.getAttribute('data-installments');
  
  console.log('Атрибут рассрочки:', installments);
  
  if (installments && installments !== 'Нет' && installments !== 'null' && installments !== 'undefined') {
    currentInstallment = this.getAttribute('data-link');
    document.getElementById('months').textContent = installments + ' мес';
    installmentBtn.style.display = 'block';
    console.log('Рассрочка доступна для:', this.querySelector('h3').textContent);
  } else {
    installmentBtn.style.display = 'none';
    console.log('Рассрочка НЕ доступна для:', this.querySelector('h3').textContent);
  }

  paymentSection.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
}

function openInstallment() {
  if (currentInstallment) {
    console.log('Открываем ссылку на рассрочку:', currentInstallment);
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
// ЗАГРУЗКА ДАННЫХ
// ======================
function loadSavedData() {
  console.log('Загрузка сохраненных данных...');
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightTheme = true;
    document.body.classList.add('light-theme');
    console.log('Загружена светлая тема');
  } else {
    console.log('Загружена темная тема (по умолчанию)');
  }
  
  const savedCharacters = localStorage.getItem('charactersCaught');
  if (savedCharacters) {
    caughtCharacters = parseInt(savedCharacters);
    console.log(`Загружено персонажей: ${caughtCharacters}`);
  }
  
  const savedReward = localStorage.getItem('characterReward');
  if (savedReward === 'true') {
    hasReward = true;
    console.log('Награда уже получена');
  }
}

// ======================
// АДАПТАЦИЯ ПРИ ИЗМЕНЕНИИ РАЗМЕРА
// ======================
window.addEventListener('resize', updateTimer);

// ======================
// ПРОВЕРКА ВСЕХ ЭЛЕМЕНТОВ
// ======================
console.log('Проверка элементов DOM:');
console.log('Таймер:', document.getElementById('countdown-timer'));
console.log('Снег контейнер:', document.querySelector('.snow-container'));
console.log('Звезды контейнер:', document.querySelector('.stars-container'));
console.log('Кнопка темы:', document.getElementById('theme-toggle'));
console.log('Карточки:', document.querySelectorAll('.card').length);
