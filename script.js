document.addEventListener('DOMContentLoaded', () => {
    const packageItems = document.querySelectorAll('.package-item');
    const paymentOptions = document.getElementById('payment-options');
    const selectedName = document.getElementById('selected-package-name');
    const selectedPrice = document.getElementById('selected-package-price');
    const body = document.body;

    packageItems.forEach(item => {
        const selectButton = item.querySelector('.select-package');
        
        selectButton.addEventListener('click', () => {
            const price = item.getAttribute('data-price');
            const name = item.getAttribute('data-name');
            
            // 1. Снимаем выделение со всех
            packageItems.forEach(i => i.style.boxShadow = '9px 9px 16px rgba(163,177,198,.6), -9px -9px 16px rgba(255,255,255, 1)');
            
            // 2. Выделяем текущий (легкое "нажатие" или акцент)
            item.style.boxShadow = 'inset 4px 4px 8px rgba(163,177,198, 0.6), inset -4px -4px 8px rgba(255,255,255, 1)';

            // 3. Обновляем информацию в блоке оплаты
            selectedName.textContent = name;
            selectedPrice.textContent = price.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Форматирование числа
            paymentOptions.style.display = 'block';

            // 4. Прокрутка к блоку оплаты
            paymentOptions.scrollIntoView({ behavior: 'smooth' });

            // **TODO: Здесь можно добавить логику, которая меняет ссылки на рассрочку
            // в зависимости от выбранного пакета (например, лимит рассрочки).**
            // Например: if (name === 'Королевский') { installmentButton.href = '...' }
        });
    });
});
