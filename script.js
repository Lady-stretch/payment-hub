document.addEventListener('DOMContentLoaded', () => {
    const packageItems = document.querySelectorAll('.package-item');
    const paymentOptions = document.getElementById('payment-options');
    const selectedName = document.getElementById('selected-package-name');
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
            const name = item.getAttribute('data-name');
            const installments = item.getAttribute('data-installments'); // Получаем инфо о рассрочке

            // 1. Снимаем выделение со всех и добавляем класс 'selected'
            packageItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            // 2. Обновляем информацию в блоке оплаты
            selectedName.textContent = name;
            selectedPrice.textContent = formatPrice(price);
            paymentOptions.style.display = 'block';

            // 3. Логика кнопки рассрочки
            if (installments !== 'Нет') {
                installmentBtn.style.display = 'inline-block';
                installmentBtn.disabled = false;
                // Меняем текст на кнопке
                installmentMonths.textContent = `до ${installments} мес.`;
            } else {
                // Скрываем или делаем кнопку неактивной, если рассрочка недоступна
                installmentBtn.style.display = 'none'; 
                // Или можно: installmentBtn.disabled = true; installmentBtn.style.opacity = 0.5;
            }

            // 4. Прокрутка к блоку оплаты
            paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
