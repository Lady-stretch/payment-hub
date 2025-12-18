/* Таймер до Нового года — без ограничений */
const END_DATE = new Date('January 1, 2026 00:00:00 GMT+0300');

function updateTimer() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;

  const diff = END_DATE - Date.now();
  if (diff <= 0) {
    el.textContent = 'С Новым годом 🎄';
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);

  el.textContent = `${d}д ${h}ч ${m}м`;
}

setInterval(updateTimer, 1000);
updateTimer();

/* Выбор пакета */
let currentInstallment = null;

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.getElementById('payment').style.display = 'block';

    document.getElementById('selected-price').textContent =
      Number(card.dataset.price).toLocaleString('ru-RU');

    if (card.dataset.installments) {
      currentInstallment = card.dataset.link;
      document.getElementById('months').textContent =
        card.dataset.installments + ' мес';
      document.getElementById('installment-btn').style.display = 'block';
    } else {
      document.getElementById('installment-btn').style.display = 'none';
    }

    document.getElementById('payment')
      .scrollIntoView({ behavior: 'smooth' });
  });
});

function openInstallment() {
  if (currentInstallment) {
    window.open(currentInstallment, '_blank');
  }
}
