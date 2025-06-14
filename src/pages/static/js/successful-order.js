document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userResponse = await fetch('/user-information');
        const userInfo = await userResponse.json();
        console.log('User info:', userInfo);

        if (!userInfo.firstName && !userInfo.lastName) {
            document.getElementById('name-fields').style.display = 'block';
        }

        if (!userInfo.email) {
            document.getElementById('email-field').style.display = 'block';
        }

        if (document.getElementById('name-fields').style.display === 'block' || 
            document.getElementById('email-field').style.display === 'block') {
            document.getElementById('submit-button-container').style.display = 'block';
        }

        const response = await fetch('/my-orders');
        const orders = await response.json();
        console.log('Orders:', orders);
        
        if (orders.length > 0) {
            const latestOrder = orders[orders.length - 1];
            console.log('Latest order:', latestOrder);
            document.getElementById('order-id').textContent = `Ваше бронирование под номером ${latestOrder.id}`;
            
            const servicesResponse = await fetch('/services');
            const allServices = await servicesResponse.json();
            console.log('All services:', allServices);
            
            const servicesMap = new Map(allServices.map(s => [s.id, s]));
            console.log('Services map:', servicesMap);
            
            const tbody = document.querySelector('#services-list tbody');
            let totalPrice = 0;
            
            latestOrder.serviceIDs.forEach(serviceId => {
                const service = servicesMap.get(serviceId);
                console.log('Service for ID', serviceId, ':', service);
                if (service) {
                    totalPrice += parseInt(service.price);
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td>${service.name}</td>
                            <td>${service.price.toLocaleString('ru-RU')} ₽</td>
                        </tr>
                    `);
                }
            });
            
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td style="font-style: italic">Всего</td>
                    <td>${totalPrice.toLocaleString('ru-RU')} ₽</td>
                </tr>
            `);
        }

        document.getElementById('submit-button').addEventListener('click', async () => {
            const data = {};
            
            if (document.getElementById('name-fields').style.display === 'block') {
                data.firstName = document.getElementById('first-name').value;
                data.lastName = document.getElementById('last-name').value;
            }
            
            if (document.getElementById('email-field').style.display === 'block') {
                data.email = document.getElementById('email').value;
            }

            try {
                const response = await fetch('/update-customer-info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });

                const result = await response.json();
                if (result.success) {
                    alert('Информация обновлена');
                    location.reload(); // Reload to hide the fields that were just filled
                } else {
                    alert('Ошибка при обновлении информации: ' + result.error);
                }
            } catch (error) {
                console.error('Error updating info:', error);
                alert('Произошла ошибка при обновлении информации');
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});
