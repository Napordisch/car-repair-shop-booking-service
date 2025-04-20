
fetch('/services').then(response => response.json()).then(data => {
    console.log(data);
    data.forEach(service => {
        const name = service.name;
        const price = service.price;
        console.log(service);
        const description = service.description;
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service';

        serviceElement.innerHTML = `
                        <label style="display:block; cursor: pointer;" class="service-label">
                        <div class="service-info">
    
                            <div class="service-name-and-price">
                                <div class="service-name-and-checkbox">
                                    <input type="checkbox" class="service-chosen">
                                    <h3 class="service-name">${name}</h3>
                                </div>
    
                                <p class="price">${price.toLocaleString('ru-RU')}&nbsp₽</p>
                            </div>
    
                            <p class="service-description">${description}</p>
                        </div>
                    </label>
                    `;

        document.getElementById('services-list').appendChild(serviceElement);

    });
    const servicesListWidth = document.getElementById('services-list').offsetWidth;
    console.log(servicesListWidth);
    const buttonContainer = document.querySelector('.button-with-price-container');
    buttonContainer.style.maxWidth = servicesListWidth + 'px';
});



document.addEventListener('change', function (e) {
    if (e.target.matches('.service-chosen')) {
        let total = 0;
        document.querySelectorAll('.service-chosen:checked').forEach(checkbox => {
            const priceText = checkbox.closest('.service').querySelector('.price').textContent;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            total += price;
        });
        document.getElementById('total-price').textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
});

function bookServices() {
    const selectedServices = [];
    document.querySelectorAll('.service-chosen:checked').forEach(checkbox => {
        const serviceName = checkbox.closest('.service').querySelector('.service-name').textContent;
        selectedServices.push(serviceName);
    });

    if (selectedServices.length === 0) {
        alert('Пожалуйста, выберите хотя бы одну услугу');
        return;
    }

    // TODO: Implement booking logic
    console.log('Selected services:', selectedServices);
}