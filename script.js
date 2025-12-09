// Глобальная переменная для хранения выбранной ссылки рассрочки
let currentInstallmentLink = '';

// Переменная для сохранения предыдущей позиции прокрутки
let lastScrollPosition = 0;

document.addEventListener('DOMContentLoaded', () => {
    const packageItems = document.querySelectorAll('.package-item');
    const paymentOptions = document.getElementById('payment-options');
    const selectedPriceSpan = document.getElementById('selected-package-price'); 
    const installmentBtn = document.getElementById('installment-btn');
    const installmentMonths = document.getElementById('installment-months');

    // Функция для форматирования числа с пробелами
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    packageItems.forEach(item => {
        const selectButton = item.querySelector('.select-package');
        
        selectButton.addEventListener('click', (event) => {
            // 1. Сохраняем текущую позицию перед скроллом
            lastScrollPosition = window.scrollY;
            
            const price = item.getAttribute('data-price');
            const installments = item.getAttribute('data-installments');
            const link = item.getAttribute('data-link'); 

            // 2. Логика выделения и отображения блока оплаты
            packageItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedPriceSpan.textContent = formatPrice(price);
            paymentOptions.style.display = 'block';

            // 3. Логика кнопки рассрочки
            if (installments !== 'Нет' && link) {
                currentInstallmentLink = link;
                installmentBtn.style.display = 'inline-block';
                installmentBtn.disabled = false;
                
                if (installments === '6') {
                    installmentMonths.textContent = `на 6 месяцев`;
                } else {
                    installmentMonths.textContent = `до ${installments} месяцев`;
                }
            } else {
                installmentBtn.style.display = 'none'; 
                currentInstallmentLink = '';
            }

            // 4. Прокрутка к блоку оплаты
            paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});

// Глобальная функция для открытия ссылки рассрочки
function openInstallmentLink() {
    if (currentInstallmentLink) {
        window.open(currentInstallmentLink, '_blank');
    }
}

// Глобальная функция для кнопки "Назад"
function goBack() {
    // Скрываем блок оплаты
    document.getElementById('payment-options').style.display = 'none';
    
    // Снимаем выделение со всех абонементов
    document.querySelectorAll('.package-item').forEach(i => i.classList.remove('selected'));

    // Возвращаем на сохраненную позицию
    window.scrollTo({
        top: lastScrollPosition,
        behavior: 'smooth'
    });
}
