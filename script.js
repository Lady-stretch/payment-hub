const END_DATE = new Date('January 5, 2025 23:59:59 GMT+0300');

/* Таймер */
function updateCountdown() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;

  const diff = END_DATE - Date.now();

  if (diff <= 0) {
    el.textContent = 'Запись в январские группы закрыта';
    document.querySelectorAll('.select-package').forEach(b => {
      b.disabled = true;
      b.textContent = 'Запись закрыта';
    });
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);

  el.textContent = `${d}д ${h}ч ${m}м`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* Социальное доказательство */
setInterval(() => {
  const el = document.getElementById('active-visitors-count');
  if (!el) return;
  let v = parseInt(el.textContent, 10);
  el.textContent = Math.min(49, Math.max(18, v + (Math.random() > 0.5 ? 1 : -1)));
}, 4000);

/* Выбор пакета */
document.querySelectorAll('.package').forEach(card => {
  card.addEventListener('click', () => {
    document.getElementById('payment-options').style.display = 'block';
    document.getElementById('selected-package-price').textContent =
      Number(card.dataset.price).toLocaleString('ru-RU');

    const inst = card.dataset.installments;
    const btn = document.getElementById('installment-btn');

    if (inst && inst !== 'Нет') {
      btn.style.display = 'block';
      document.getElementById('installment-months').textContent = inst + ' мес';
      window.currentLink = card.dataset.link;
    } else {
      btn.style.display = 'none';
    }

    document.getElementById('payment-options')
      .scrollIntoView({ behavior: 'smooth' });
  });
});

/* Рассрочка */
function openInstallmentLink() {
  if (window.currentLink) {
    window.open(window.currentLink, '_blank');
  }
}
