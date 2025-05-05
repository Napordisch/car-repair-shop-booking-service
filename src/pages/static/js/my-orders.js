document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/my-orders');
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        
        const servicesResponse = await fetch('/services');
        const allServices = await servicesResponse.json();
        
        const servicesMap = new Map(allServices.map(s => [s.id, s]));
        
        const container = document.getElementById('bookings-container');
        
        if (orders.length === 0) {
            container.insertAdjacentHTML('beforeend', '<p>У вас нет бронирований</p>');
            return;
        }
        
        orders.forEach(order => {
            const initialVisit = new Date(order.initialVisit);
            const deadline = new Date(order.deadline);
            
            const orderHTML = `
                <div class="booking-item" id="booking-${order.id}">
                    <div class="booking-header">
                        <h2>${order.id}</h2>
                        <button class="delete-button" onclick="deleteBooking(${order.id})">Отменить</button>
                    </div>
                    <div class="booking-details">
                        <p>Время визита: ${initialVisit.toLocaleString('ru-RU')}</p>
                        <p>Ожидаемое время завершения: ${deadline.toLocaleString('ru-RU')}</p>
                        <p>Парковочное место: ${order.parkingSpace}</p>
                        <p>Услуги:</p>
                        <ul>
                            ${order.serviceIDs.map(serviceId => {
                                const service = servicesMap.get(serviceId);
                                return `<li class="service-item">${service ? service.name : 'Неизвестная услуга'}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', orderHTML);
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('bookings-container').insertAdjacentHTML('beforeend', 
            '<p>Произошла ошибка при загрузке бронирований</p>'
        );
    }
});

async function deleteBooking(orderId) {
    if (!confirm('Вы уверены, что хотите удалить это бронирование?')) {
        return;
    }

    try {
        const response = await fetch(`/my-orders/${orderId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        const result = await response.json();
        
        if (result.success) {
            const bookingElement = document.getElementById(`booking-${orderId}`);
            if (bookingElement) {
                bookingElement.remove();
            }
            
            if (document.querySelectorAll('.booking-item').length === 0) {
                document.getElementById('bookings-container').insertAdjacentHTML('beforeend', 
                    '<p>У вас нет бронирований</p>'
                );
            }
        } else {
            alert('Ошибка при удалении бронирования: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Произошла ошибка при удалении бронирования');
    }
} 