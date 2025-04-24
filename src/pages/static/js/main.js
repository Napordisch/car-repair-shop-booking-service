class Service {
    constructor(id, name, price, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
    }
}

let services = {};

fetch('/services')
    .then(response => response.json())
    .then(data => {
        data.forEach(service => {
            const new_service = new Service(service.id, service.name, service.price, service.description);
            if (new_service.name == null || new_service.name.trim() == "") {
                return;
            }
            if (new_service.description == null) {
                new_service.description = "";
            }
            services[new_service.id] = new_service;
            const serviceElement = document.createElement('div');

            serviceElement.className = 'service';
            serviceElement.id = new_service.id;
            serviceElement.innerHTML = `
                        <label style="display:block; cursor: pointer;" class="service-label">
                        <div class="service-info">
    
                            <div class="service-name-and-price">
                                <div class="service-name-and-checkbox">
                                    <input type="checkbox" class="service-chosen">
                                    <h3 class="service-name">${new_service.name}</h3>
                                </div>
    
                                <p class="price">${new_service.price.toLocaleString('ru-RU')} ₽</p>
                            </div>
    
                            <p class="service-description">${new_service.description}</p>
                        </div>
                    </label>
                    `;

            document.getElementById('services-list').appendChild(serviceElement);

        });

        const servicesListWidth = document.getElementById('services-list').offsetWidth;
        const buttonContainer = document.querySelector('.button-with-price-container');
        buttonContainer.style.maxWidth = servicesListWidth + 'px';

        sessionStorage.setItem('services', JSON.stringify(services));
    });


let selectedServices = [];

document.addEventListener('change', function (e) {
    selectedServices = [];
    console.log(e);
    if (e.target.matches('.service-chosen')) {
        let total = 0;
        document.querySelectorAll('.service-chosen:checked').forEach(checkbox => {
            const serviceId = checkbox.closest('.service').id;
            selectedServices.push(serviceId);

            const price = parseInt(services[serviceId]
                .price
                .toLocaleString('ru-RU')
                .replace(/[^\d]/g, ''));

            total += price;
        });
        document.getElementById('total-price').textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
});

function bookServices() {
    if (selectedServices.length === 0) {
        alert('Пожалуйста, выберите хотя бы одну услугу');
        return;
    }

    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    location.href = '/order';
}
