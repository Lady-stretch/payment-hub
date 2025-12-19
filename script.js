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
  console.log('DOM загружен, запускаем инициализацию...');
  
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
  
  console.log('Инициализация завершена');
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
  
  console.log('Снег создан: 80 снежинок');
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
  
  console.log('Звезды созданы: 150 звезд');
}

// ======================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ======================
function setupEventListeners() {
  console.log('Настраиваем обработчики событий...');
  
  // Кнопка темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    console.log('Кнопка темы подключена');
  }
  
  // Выбор пакетов
  const cards = document.querySelectorAll('.card');
  console.log(`Найдено карточек: ${cards.length}`);
  
  cards.forEach(card => {
    card.addEventListener('click', selectPackage);
    
    // Обработчик для кнопки внутри карточки
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

function selectPackage() {
  console.log('Выбран пакет:', this.querySelector('h3').textContent);
  
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

  // Настройка кнопки рассрочки
  const installmentBtn = document.getElementById('installment-btn');
  const installments = this.getAttribute('data-installments');
  
  if (installments && installments !== 'null') {
    currentInstallment = this.getAttribute('data-link');
    document.getElementById('months').textContent = installments;
    installmentBtn.style.display = 'block';
    console.log('Рассрочка доступна:', installments, 'месяцев');
  } else {
    installmentBtn.style.display = 'none';
    console.log('Рассрочка не доступна');
  }

  // Плавный скролл к блоку оплаты
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

function toggleTheme() {
  console.log('Переключение темы...');
  isLightTheme = !isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  
  // Обновляем звезды и снеговиков
  if (isLightTheme) {
    // В светлой теме останавливаем снеговиков
    clearInterval(snowmanInterval);
    removeAllSnowmen();
    document.querySelector('.snowman-counter').style.display = 'none';
  } else {
    // В темной теме запускаем снеговиков
    createStars();
    startSnowmanFall();
    updateSnowmanCounter();
  }
  
  console.log('Тема переключена:', isLightTheme ? 'светлая' : 'темная');
}

function loadSavedData() {
  console.log('Загружаем сохраненные данные...');
  
  // Загружаем тему
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightTheme = true;
    document.body.classList.add('light-theme');
    console.log('Загружена светлая тема');
  } else {
    console.log('Загружена темная тема (по умолчанию)');
 
