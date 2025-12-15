// Конечная дата: 17 декабря 2025 года (Финальный Week-end)
const END_DATE = new Date('December 17, 2025 23:59:59 GMT+0300'); 

function updateCountdown() {
    const now = new Date().getTime();
    const distance = END_DATE.getTime() - now;
    let timerDisplay = document.getElementById("countdown-timer");

    if (distance < 0) {
        timerDisplay.innerHTML = "АКЦИЯ ОКОНЧАТЕЛЬНО ЗАВЕРШЕНА";
        document.querySelectorAll('.select-package').forEach(b => {
            b.disabled = true; b.textContent = 'Мест нет'; b.style.opacity = '0.5';
        });
        return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    const f = (t) => String(t).padStart(2, '0');

    timerDisplay.innerHTML = `<span>${f(d)}</span>д : <span>${f(h)}</span>ч : <span>${f(m)}</span>м : <span>${f(s)}</span>с`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Имитация живых посетителей
setInterval(() => {
    const el = document.getElementById('active-visitors-count');
    if(el) {
        let val = parseInt(el.innerText);
        el.innerText = val + (Math.random() > 0.5 ? 1 : -1);
    }
}, 4000);

const packages = document.querySelectorAll('.package-item');
const paymentOptions = document.getElementById('payment-options');

packages.forEach(pkg => {
    pkg.addEventListener('click', function() {
        if (this.querySelector('.select-package').disabled) return;
        packages.forEach(p => {
            p.classList.remove('selected');
            p.querySelector('.select-package').textContent = 'Выбрать';
        });
        this.classList.add('selected');
        this.querySelector('.select-package').textContent = 'Выбрано';
        document.getElementById('selected-package-price').textContent = parseInt(this.dataset.price).toLocaleString('ru-RU');
        paymentOptions.style.display = 'block';

        const instBtn = document.getElementById('installment-btn');
        if (this.dataset.installments !== 'Нет') {
            instBtn.style.display = 'block';
            document.getElementById('installment-months').textContent = this.dataset.installments + ' мес.';
            window.currentLink = this.dataset.link;
        } else { instBtn.style.display = 'none'; }
        paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function goBack() {
    paymentOptions.style.display = 'none';
    packages.forEach(p => {
        p.classList.remove('selected');
        p.querySelector('.select-package').textContent = 'Выбрать';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openInstallmentLink() {
    if (window.currentLink) window.open(window.currentLink, '_blank');
}
