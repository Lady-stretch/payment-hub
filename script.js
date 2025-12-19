/* Эффект снега */
function createSnow() {
  const snowContainer = document.querySelector('.snow-container');
  if (!snowContainer) return;
  
  const snowflakes = ['❄', '•', '✻', '✾', '❉'];
  
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
    
    // Случайная позиция
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    // Случайная скорость и размер
    const size = Math.random() * 1.2 + 0.8;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;
    
    snowflake.style.fontSize = size + 'em';
    snowflake.style.animationDuration = duration + 's';
    snowflake.style.animationDelay = delay + 's';
    
    snowContainer.appendChild(snowflake);
  }
}

/* Таймер до Нового года с секундами */
const END_DATE = new Date('January 1, 2026 00:00:00 GMT+0300');

function updateTimer() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;

  const diff = END_DATE - Date.now();
  
  if (diff <= 0) {
    el.textContent = 'С Новым годом! 🎄';
    el.style.fontSize = '2.2rem';
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  // Форматирование с ведущими нулями
  const format = (num) => num < 10 ? '0' + num : num;
  
  el.innerHTML = `${format(d)}<span style="font-size:0.7em">д</span> : ${format(h)}<span style="font-size:0.7em">ч</span> : ${format(m)}<span style="font-size:0.7em">м</span> : ${format(s)}<span style="font-size:0.7em">с</span>`;
}

/* Выбор пакета */
let currentInstallment = null;

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    // Сбрасываем предыдущий выбор
    document.querySelectorAll('.card').forEach(c => {
      c.style.borderColor = '';
    });
    
    // Выделяем выбранную карточку
    card.style.borderColor = '#4a6fa5';
    card.style.borderWidth = '2px';
    card.style.borderStyle = 'solid';
    
    // Показываем блок оплаты
    document.getElementById('payment').style.display = 'block';

    // Устанавливаем цену
    document.getElementById('selected-price').textContent =
      Number(card.dataset.price).toLocaleString('ru-RU');

    // Настройка кнопки рассрочки
    const installmentBtn = document.getElementById('installment-btn');
    if (card.dataset.installments) {
      currentInstallment = card.dataset.link;
      document.getElementById('months').textContent =
        card.dataset.installments;
      installmentBtn.style.display = 'block';
    } else {
      installmentBtn.style.display = 'none';
    }

    // Плавный скролл к блоку оплаты
    document.getElementById('payment')
      .scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function openInstallment() {
  if (currentInstallment) {
    window.open(currentInstallment, '_blank');
  }
}

/* Кнопка "Назад" */
function goBack() {
  document.getElementById('payment').style.display = 'none';
  
  // Сбрасываем выделение карточек
  document.querySelectorAll('.card').forEach(card => {
    card.style.borderColor = '';
    card.style.borderWidth = '';
    card.style.borderStyle = '';
  });
  
  // Скролл к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Инициализация */
document.addEventListener('DOMContentLoaded', () => {
  createSnow();
  updateTimer();
  setInterval(updateTimer, 1000);
});
