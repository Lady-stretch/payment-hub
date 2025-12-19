// ======================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ======================
let currentInstallment = null;
let caughtSnowmen = 0;
const SNOWMEN_FOR_REWARD = 3;
let hasReward = false;
let isLightTheme = false;
let snowmanInterval;

// ======================
// ИНИЦИАЛИЗАЦИЯ
// ======================
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Запускаем снеговиков (только в темной теме)
  if (!isLightTheme) {
    startSnowmanFall();
  }
  
  // Показываем счетчик если уже ловили снеговиков
  updateSnowmanCounter();
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
// СНЕГОПАД
// ======================
function createSnow() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  const snowflakes = ['❄', '•', '✻', '✾', '❉'];
  
  // Очищаем контейнер
  snowContainer.innerHTML = '';
  
  for (let i = 0; i < 80; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    const size = Math.random() * 1.5 + 0.5;
    const duration = Math.random() * 8 + 8;
    const delay = Math.random() * 5;
    
    snowflake.style.fontSize = size + 'em';
    snowflake.style.animationDuration = duration + 's';
    snowflake.style.animationDelay = delay + 's';
    
    snowContainer.appendChild(snowflake);
  }
}

// ======================
// ЗВЕЗДНОЕ НЕБО
// ======================
function createStars() {
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  // Очищаем контейнер
  starsContainer.innerHTML = '';
  
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    const starSize = Math.random() * 3 + 1;
    star.style.width = starSize + 'px';
    star.style.height = starSize + 'px';
    star.style.opacity = Math.random() * 0.8 + 0.2;
    
    star.style.animationDuration = Math.random() * 4 + 2 + 's';
    star.style.animationDelay = Math.random() * 3 + 's';
    
    starsContainer.appendChild(star);
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
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Если кликнули на кнопку "Выбрать формат", не выполняем дважды
      if (e.target.classList.contains('select')) {
        selectPackage.call(this);
        return;
      }
      
      // Если кликнули на саму карточку (но не на кнопку)
      if (e.target === this || e.target.closest('.desc') || e.target.closest('.price')) {
        selectPackage.call(this);
      }
    });
    
    // Отдельный обработчик для кнопки
    const selectBtn = card.querySelector('.select');
    if (selectBtn) {
      selectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectPackage.call(card);
      });
    }
  });
}

function selectPackage() {
  // Сбрасываем предыдущий выбор
  document.querySelectorAll('.card').forEach(c => {
    c.style.borderColor = '';
    c.style.borderWidth = '';
    c.style.borderStyle = '';
  });
  
  // Выделяем выбранную карточку
  this.style.borderColor = '#4a6fa5';
  this.style.borderWidth = '2px';
  this.style.borderStyle = 'solid';
  
  // Показываем блок оплаты
  const paymentSection = document.getElementById('payment');
  paymentSection.style.display = 'block';
  
  // Устанавливаем цену
  const price = this.getAttribute('data-price');
  document.getElementById('selected-price').textContent = 
    Number(price).toLocaleString('ru-RU');

  // ИСПРАВЛЕНИЕ РАССРОЧКИ - проверяем явно
  const installmentBtn = document.getElementById('installment-btn');
  const installments = this.getAttribute('data-installments');
  
  // Для 32 и 16 занятий в HTML должно быть data-installments="Нет"
  if (installments && installments !== 'Нет' && installments !== 'null' && installments !== 'undefined') {
    currentInstallment = this.getAttribute('data-link');
    document.getElementById('months').textContent = installments;
    installmentBtn.style.display = 'block';
    console.log('Рассрочка доступна для:', this.querySelector('h3').textContent);
  } else {
    installmentBtn.style.display = 'none';
    console.log('Рассрочка НЕ доступна для:', this.querySelector('h3').textContent);
  }

  // Плавный скролл к блоку оплаты
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

// ======================
// КНОПКА НАЗАД
// ======================
function goBack() {
  const paymentSection = document.getElementById('payment');
  paymentSection.style.display = 'none';
  
  // Сбрасываем выделение карточек
  document.querySelectorAll('.card').forEach(card => {
    card.style.borderColor = '';
    card.style.borderWidth = '';
    card.style.borderStyle = '';
  });
  
  // Скролл к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTheme() {
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  
  // Обновляем звезды и снеговиков
  if (isLightTheme) {
    // В светлой теме останавливаем снеговиков
    clearInterval(snowmanInterval);
    removeAllSnowmen();
    const counter = document.getElementById('snowman-counter');
    if (counter) counter.style.display = 'none';
  } else {
    // В темной теме запускаем снеговиков
    createStars();
    startSnowmanFall();
    updateSnowmanCounter();
  }
}

// ======================
// ЗАГРУЗКА ДАННЫХ
// ======================
function loadSavedData() {
  // Загружаем тему
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightTheme = true;
    document.body.classList.add('light-theme');
  }
  
  // Загружаем снеговиков
  const savedSnowmen = localStorage.getItem('snowmanCaught');
  if (savedSnowmen) {
    caughtSnowmen = parseInt(savedSnowmen);
  }
  
  // Загружаем награду
  const savedReward = localStorage.getItem('snowmanReward');
  if (savedReward === 'true') {
    hasReward = true;
  }
}

// ======================
// СНЕГОВИКИ И ИГРА
// ======================
function createSnowman() {
  if (hasReward || isLightTheme) return;
  
  const snowman = document.createElement('div');
  snowman.className = 'snowman';
  snowman.innerHTML = '⛄';
  snowman.style.left = Math.random() * 85 + 5 + 'vw';
  snowman.style.fontSize = Math.random() * 30 + 40 + 'px';
  
  const duration = Math.random() * 10 + 15;
  snowman.style.animation = `snowman-fall ${duration}s linear forwards`;
  
  snowman.addEventListener('click', catchSnowman);
  
  document.querySelector('.snow-container').appendChild(snowman);
  
  setTimeout(() => {
    if (snowman.parentNode) {
      snowman.remove();
    }
  }, duration * 1000);
}

function startSnowmanFall() {
  if (hasReward || isLightTheme) return;
  
  // Первый снеговик через 5 секунд
  setTimeout(() => {
    if (!hasReward && !isLightTheme) createSnowman();
  }, 5000);
  
  // Затем каждые 20-40 секунд
  snowmanInterval = setInterval(() => {
    if (!hasReward && !isLightTheme && Math.random() > 0.5) {
      createSnowman();
    }
  }, 20000);
}

function removeAllSnowmen() {
  document.querySelectorAll('.snowman').forEach(snowman => {
    snowman.remove();
  });
}

function catchSnowman(event) {
  if (hasReward || isLightTheme) return;
  
  const snowman = event.target;
  
  // Анимация исчезновения
  snowman.style.transform = 'scale(0)';
  snowman.style.transition = 'transform 0.3s ease';
  
  // Увеличиваем счет
  caughtSnowmen++;
  localStorage.setItem('snowmanCaught', caughtSnowmen.toString());
  
  // Создаем эффект
  createCatchEffect(event.clientX, event.clientY);
  
  // Обновляем счетчик
  updateSnowmanCounter();
  
  // Проверяем награду
  checkForReward();
  
  // Удаляем снеговика
  setTimeout(() => {
    if (snowman.parentNode) {
      snowman.remove();
    }
  }, 300);
}

function createCatchEffect(x, y) {
  const effect = document.createElement('div');
  effect.className = 'catch-effect';
  effect.innerHTML = '🎁 +1';
  effect.style.left = (x - 20) + 'px';
  effect.style.top = (y - 20) + 'px';
  effect.style.color = '#FFD700';
  effect.style.fontWeight: 'bold';
  
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

function updateSnowmanCounter() {
  const counter = document.getElementById('snowman-counter');
  const countSpan = document.getElementById('snowman-count');
  
  if (caughtSnowmen > 0 && !isLightTheme) {
    if (counter) {
      counter.style.display = 'block';
      if (countSpan) {
        countSpan.textContent = caughtSnowmen;
      }
      
      // Если награда получена
      if (hasReward) {
        counter.innerHTML = '⛄ Награда получена! 🎁';
        counter.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
      }
    }
  } else if (counter) {
    counter.style.display = 'none';
  }
}

function checkForReward() {
  if (!hasReward && caughtSnowmen >= SNOWMEN_FOR_REWARD) {
    hasReward = true;
    localStorage.setItem('snowmanReward', 'true');
    showRewardNotification();
    updateSnowmanCounter();
  }
}

function showRewardNotification() {
  const notification = document.createElement('div');
  notification.className = 'reward-notification';
  notification.innerHTML = `
    <h3>🎉 Поздравляем!</h3>
    <p>Вы поймали ${SNOWMEN_FOR_REWARD} снеговиков!</
