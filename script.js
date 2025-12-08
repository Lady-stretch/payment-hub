// Глобальная переменная для хранения выбранной ссылки рассрочки
let currentInstallmentLink = '';

document.addEventListener('DOMContentLoaded', () => {
    const packageItems = document.querySelectorAll('.package-item');
    const paymentOptions = document.getElementById('payment-options');
    const selectedPrice = document.getElementById('selected-package-price');
    const installmentBtn = document.getElementById('installment-btn');
    const installmentMonths = document.getElementById('installment-months');

    // Функция для форматирования числа с пробелами (например, 34 320)
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    packageItems.forEach(item => {
        const selectButton = item.querySelector('.select-package');
        
        selectButton.addEventListener('click', () => {
            const price = item.getAttribute('data-price');
            const installments = item.getAttribute('data-installments');
            const link = item.getAttribute('data-link'); // Получаем ссылку рассрочки

            // 1. Снимаем выделение со всех и добавляем класс 'selected'
            packageItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            // 2. Обновляем информацию в блоке оплаты
            selectedPrice.textContent = formatPrice(price);
            paymentOptions.style.display = 'block';

            // 3. Логика кнопки рассрочки
            if (installments !== 'Нет' && link) {
                // Активируем кнопку только для пакетов с рассрочкой
                currentInstallmentLink = link;
                installmentBtn.style.display = 'inline-block';
                installmentBtn.disabled = false;
                
                // Установка текста в зависимости от срока
                if (installments === '6') {
                    installmentMonths.textContent = `на 6 месяцев`;
                } else {
                    installmentMonths.textContent = `до ${installments} месяцев`;
                }

            } else {
                // Скрываем, если рассрочка недоступна для этого пакета
                installmentBtn.style.display = 'none'; 
                currentInstallmentLink = '';
            }

            // 4. Прокрутка к блоку оплаты
            paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});

// Глобальная функция для открытия ссылки рассрочки (вызывается из HTML)
function openInstallmentLink() {
    if (currentInstallmentLink) {
        window.open(currentInstallmentLink, '_blank');
    }
}
