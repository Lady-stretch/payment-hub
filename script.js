// ===============================================
// === ЛОГИКА ТАЙМЕРА ОБРАТНОГО ОТСЧЕТА ===
// ===============================================

// 1. Устанавливаем конечную дату акции: 15 декабря 2025 года, 23:59:59, по МСК (GMT+0300)
// Таймер сразу начинает отсчет до этой даты.
const END_DATE = new Date('December 15, 2025 23:59:59 GMT+0300'); 

function updateCountdown() {
    const now = new Date().getTime();
    const distance = END_DATE.getTime() - now;
    
    let timerElement = document.getElementById("countdown-timer");

    // Если время вышло
    if (distance < 0) {
        clearInterval(countdownInterval); 
        timerElement.innerHTML = "АКЦИЯ ЗАВЕРШЕНА!";
        
        // --- БЛОКИРОВКА КНОПОК ПОКУПКИ ---
        document.querySelectorAll('.select-package').forEach(button => {
            button.disabled = true;
            button.textContent = 'Акция завершена';
            button.style.opacity = '0.5';
            button.style.boxShadow = 'none'; // Убираем эффект неоморфизма для неактивной кнопки
            button.style.cursor = 'default';
        });
        document.getElementById('payment-options').style.display = 'none'; // Скрываем блок оплаты
        // --------------------------------

        return;
    }

    // Расчет времени для дней, часов, минут и секунд
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Добавляем нули спереди (01, 05)
    const format = (t) => String(t).padStart(2, '0');

    // Обновляем HTML
    timerElement.innerHTML = `<p style="margin-bottom: 5px;">До конца акции осталось:</p>
                                <span id="days">${format(days)}</span>д : 
                                <span id="hours">${format(hours)}</span>ч : 
                                <span id="minutes">${format(minutes)}</span>м : 
                                <span id="seconds">${format(seconds)}</span>с`;
}

// Запускаем обновление таймера каждую секунду
updateCountdown(); 
const countdownInterval = setInterval(updateCountdown, 1000);

// ===============================================
// === КОНЕЦ ЛОГИКИ ТАЙМЕРА ===
// ===============================================


// === ОСНОВНАЯ ЛОГИКА САЙТА ===

let selectedPrice = 0;
let installmentLink = '';
let installmentMonths = '';

const packages = document.querySelectorAll('.package-item');
const priceDisplay = document.getElementById('selected-package-price');
const paymentOptions = document.getElementById('payment-options');
const priceButtonLink = document.getElementById('price-button-link');
const installmentBtn = document.getElementById('installment-btn');
const installmentMonthsSpan = document.getElementById('installment-months');

packages.forEach(pkg => {
    pkg.addEventListener('click', function() {
        // Проверяем, активна ли кнопка (если акция завершена, кнопка будет disabled)
        if (this.querySelector('.select-package').disabled) {
            return; 
        }

        // Сброс всех выбранных элементов
        packages.forEach(p => p.classList.remove('selected'));
        
        // Выделение текущего элемента
        this.classList.add('selected');
        
        // Сбор данных
        selectedPrice = parseInt(this.dataset.price);
        installmentLink = this.dataset.link;
        installmentMonths = this.dataset.installments;

        // Обновление цены и ссылки СБП
        priceDisplay.textContent = selectedPrice.toLocaleString('ru-RU');
        
        // Показ опций оплаты
        paymentOptions.style.display = 'block';

        // Логика рассрочки
        if (installmentMonths !== 'Нет' && installmentLink) {
            installmentBtn.style.display = 'block';
            installmentMonthsSpan.textContent = `${installmentMonths} мес.`;
        } else {
            installmentBtn.style.display = 'none';
        }

        // Плавный скролл к опциям оплаты
        paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function openInstallmentLink() {
    if (installmentLink) {
        window.open(installmentLink, '_blank');
    }
}

function goBack() {
    // Скрываем опции оплаты
    paymentOptions.style.display = 'none';
    // Сбрасываем выделение
    packages.forEach(p => p.classList.remove('selected'));
    // Плавный скролл к началу пакетов
    document.querySelector('.packages-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
