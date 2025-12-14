// === ТАЙМЕР ===
const END_DATE = new Date('December 15, 2025 23:59:59 GMT+0300'); 

function updateCountdown() {
    const now = new Date().getTime();
    const distance = END_DATE.getTime() - now;
    let timerDisplay = document.getElementById("countdown-timer");
    let timerCaption = document.querySelector(".timer-caption");

    if (distance < 0) {
        clearInterval(countdownInterval); 
        timerDisplay.innerHTML = "АКЦИЯ ЗАВЕРШЕНА!";
        if(timerCaption) timerCaption.style.display = 'none';
        document.querySelectorAll('.select-package').forEach(button => {
            button.disabled = true;
            button.textContent = 'Завершено';
            button.style.opacity = '0.5';
        });
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const format = (t) => String(t).padStart(2, '0');

    timerDisplay.innerHTML = `<span>${format(days)}</span>д : <span>${format(hours)}</span>ч : <span>${format(minutes)}</span>м : <span>${format(seconds)}</span>с`;
}
updateCountdown(); 
const countdownInterval = setInterval(updateCountdown, 1000);

// === ИМИТАЦИЯ ПОСЕТИТЕЛЕЙ ===
function updateVisitorsCount() {
    const countElement = document.getElementById('active-visitors-count');
    if (!countElement) return;
    let current = parseInt(countElement.textContent) || 20;
    let change = Math.floor(Math.random() * 3) - 1;
    let newCount = Math.min(Math.max(current + change, 15), 35);
    countElement.textContent = String(newCount).padStart(2, '0');
}
setInterval(updateVisitorsCount, 5000);
updateVisitorsCount();

// === ЛОГИКА ВЫБОРА ПАКЕТА ===
const packages = document.querySelectorAll('.package-item');
const paymentOptions = document.getElementById('payment-options');

packages.forEach(pkg => {
    pkg.addEventListener('click', function() {
        if (this.querySelector('.select-package').disabled) return;

        // Сбрасываем все карточки
        packages.forEach(p => {
            p.classList.remove('selected');
            p.querySelector('.select-package').textContent = 'Выбрать';
        });
        
        // Активируем текущую
        this.classList.add('selected');
        this.querySelector('.select-package').textContent = 'Выбрано';
        
        const price = parseInt(this.dataset.price);
        document.getElementById('selected-package-price').textContent = price.toLocaleString('ru-RU');
        paymentOptions.style.display = 'block';

        const instBtn = document.getElementById('installment-btn');
        if (this.dataset.installments !== 'Нет') {
            instBtn.style.display = 'block';
            document.getElementById('installment-months').textContent = this.dataset.installments + ' мес.';
            window.currentInstallmentLink = this.dataset.link;
        } else {
            instBtn.style.display = 'none';
        }

        paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function goBack() {
    paymentOptions.style.display = 'none';
    packages.forEach(p => {
        p.classList.remove('selected');
        p.querySelector('.select-package').textContent = 'Выбрать';
    });
    document.querySelector('.packages-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openInstallmentLink() {
    if (window.currentInstallmentLink) window.open(window.currentInstallmentLink, '_blank');
}
