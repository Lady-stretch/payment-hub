// Таймер
const endDate = new Date('Dec 15, 2025 23:59:59').getTime();

const timer = setInterval(() => {
    const now = new Date().getTime();
    const t = endDate - now;
    if (t < 0) {
        clearInterval(timer);
        document.getElementById('countdown-timer').innerHTML = "АКЦИЯ ЗАВЕРШЕНА";
        return;
    }
    const d = Math.floor(t/(1000*60*60*24));
    const h = Math.floor((t%(1000*60*60*24))/(1000*60*60));
    const m = Math.floor((t%(1000*60*60))/(1000*60));
    const s = Math.floor((t%(1000*60))/1000);
    document.getElementById('days').innerText = d;
    document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0'+m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0'+s : s;
}, 1000);

// Имитация посетителей
setInterval(() => {
    const el = document.getElementById('active-visitors-count');
    let val = parseInt(el.innerText);
    el.innerText = val + (Math.random() > 0.5 ? 1 : -1);
}, 4000);

// Выбор пакета
let installmentUrl = '';
const options = document.getElementById('payment-options');

document.querySelectorAll('.package-item').forEach(item => {
    item.addEventListener('click', () => {
        // Убираем выделение у всех
        document.querySelectorAll('.package-item').forEach(i => {
            i.classList.remove('selected');
            i.querySelector('.select-package').innerText = 'Выбрать';
        });

        // Выделяем текущий
        item.classList.add('selected');
        item.querySelector('.select-package').innerText = 'Выбрано';

        // Данные
        const price = item.getAttribute('data-price');
        const inst = item.getAttribute('data-installments');
        installmentUrl = item.getAttribute('data-link');

        document.getElementById('selected-package-price').innerText = parseInt(price).toLocaleString();
        
        const instBtn = document.getElementById('installment-btn');
        if(inst !== "Нет") {
            instBtn.style.display = 'block';
            document.getElementById('installment-months').innerText = inst + ' мес.';
        } else {
            instBtn.style.display = 'none';
        }

        options.style.display = 'block';
        options.scrollIntoView({ behavior: 'smooth' });
    });
});

function goBack() {
    options.style.display = 'none';
    document.querySelectorAll('.package-item').forEach(i => {
        i.classList.remove('selected');
        i.querySelector('.select-package').innerText = 'Выбрать';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openInstallmentLink() {
    if(installmentUrl) window.open(installmentUrl, '_blank');
}
