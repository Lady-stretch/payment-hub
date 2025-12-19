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
  
  // Запускаем снеговиков
  startSnowmanFall();
  
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
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

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
  
  const isMobile = window.innerWidth < 768;
  el.style.fontSize = isMobile ? '1.5rem' : '2.5rem';
}

// ======================
// СНЕГОПАД
// ======================
function createSnow() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  const snowflakes = ['❄', '•', '✻', '✾', '❉'];
  
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    const size = Math.random() * 1.2 + 0.8;
    const duration = Math.random() * 10 + 10;
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
  
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.width = Math.random() * 3 + 1 + 'px';
    star.style.height = star.style.width;
    star.style.opacity = Math.random() * 0.8 + 0.2;
    
    star.style.animationDuration = Math.random() * 5 + 3 + 's';
    star.style.animationDelay = Math.random() * 2 + 's';
    
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
    card.addEventListener('click', () => {
      document.querySelectorAll('.card').forEach(c => {
        c.style.borderColor = '';
      });
      
      card.style.borderColor = '#4a6fa5';
      card.style.borderWidth = '2px';
      card.style.borderStyle = 'solid';
      
      document.getElementById('payment').style.display = 'block';
      document.getElementById('selected-price').textContent =
        Number(card.dataset.price).toLocaleString('ru-RU');

      const installmentBtn = document.getElementById('installment-btn');
      if (card.dataset.installments) {
        currentInstallment = card.dataset.link;
        document.getElementById('months').textContent =
          card.dataset.installments + ' мес';
        installmentBtn.style.display = 'block';
      } else {
        installmentBtn.style.display = 'none';
      }

      document.getElementById('payment')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function toggleTheme() {
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
}

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
  if (hasReward) return; // Не создаем снеговиков если награда уже получена
  
  const snowman = document.createElement('div');
  snowman.className = 'snowman';
  snowman.innerHTML = '⛄';
  snowman.style.left = Math.random() * 85 + 5 + 'vw';
  snowman.style.fontSize = Math.random() * 30 + 40 + 'px';
  
  const duration = Math.random() * 10 + 15;
  snowman.style.animation = `fall ${duration}s linear forwards`;
  
  snowman.addEventListener('click', catchSnowman);
  snowman.addEventListener('mouseenter', () => {
    snowman.style.transform = 'scale(1.2)';
  });
  snowman.addEventListener('mouseleave', () => {
    snowman.style.transform = 'scale(1)';
  });
  
  document.querySelector('.snow-container').appendChild(snowman);
  
  setTimeout(() => {
    if (snowman.parentNode) {
      snowman.remove();
    }
  }, duration * 1000);
}

function startSnowmanFall() {
  if (hasReward) return;
  
  // Первый снеговик через 5 секунд
  setTimeout(() => {
    if (!hasReward) createSnowman();
  }, 5000);
  
  // Затем каждые 20-40 секунд
  snowmanInterval = setInterval(() => {
    if (!hasReward && Math.random() > 0.5) {
      createSnowman();
    }
  }, 20000);
}

function catchSnowman(event) {
  if (hasReward) return;
  
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
  effect.style.fontWeight = 'bold';
  
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

function updateSnowmanCounter() {
  const counter = document.getElementById('snowman-counter');
  const countSpan = document.getElementById('snowman-count');
  
  if (caughtSnow
