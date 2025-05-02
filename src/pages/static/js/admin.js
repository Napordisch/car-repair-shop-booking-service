// Admin functions for managing the car repair shop

// Fetch all services (including inactive ones)
async function fetchAllServices() {
    try {
        const response = await fetch('/admin/services');
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
}

// Update service status (active/inactive)
async function updateServiceStatus(serviceId, isActive) {
    try {
        const response = await fetch(`/admin/services/${serviceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active: isActive })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update service status');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating service status:', error);
        throw error;
    }
}

// Fetch all orders
async function fetchAllOrders() {
    try {
        const response = await fetch('/admin/orders');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}


// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Display services in the admin panel
async function displayServices() {
    try {
        const services = await fetchAllServices();
        const servicesContainer = document.getElementById('services-container');
        
        if (!servicesContainer) return;
        
        servicesContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${services.map(service => `
                        <tr>
                            <td>${service.id}</td>
                            <td>${service.name}</td>
                            <td>${service.price.toLocaleString('ru-RU')} ₽</td>
                            <td>${service.active ? 'Активна' : 'Неактивна'}</td>
                            <td>
                                <button onclick="toggleServiceStatus(${service.id}, ${!service.active})">
                                    ${service.active ? 'Деактивировать' : 'Активировать'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error displaying services:', error);
    }
}

function utcToLocalDatetimeString(utcIsoString) {
    const date = new Date(utcIsoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Display orders in the admin panel
async function displayOrders() {
    try {
        const orders = await fetchAllOrders();
        const ordersContainer = document.getElementById('orders-container');
        
        if (!ordersContainer) return;
        
        ordersContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Парковочное место</th>
                        <th>Имя клиента</th>
                        <th>ID клиента</th>
                        <th>Дата визита</th>
                        <th>Ожидаемое завершение</th>
                        <th>Услуги</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        const totalPrice = order.services.reduce((sum, service) => sum + service.price, 0);
                        return `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.parkingSpace}</td>
                                <td>${order.firstName || order.lastName ? `${order.firstName || ''} ${order.lastName || ''}`.trim() : 'Не указано'}</td>
                                <td>${order.customerID}</td>
                                <td>${formatDate(order.initialVisit)}</td>
                                <td><input type="datetime-local" value="${utcToLocalDatetimeString(order.deadline)}" onchange="updateDeadline(${order.id}, this.value)"></td>
                                <td>${order.services.map(service => service.name).join(', ')}</td>
                                <td>${totalPrice.toLocaleString('ru-RU')} ₽</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error displaying orders:', error);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await displayServices();
        await displayOrders();
    } catch (error) {
        console.error('Error initializing admin panel:', error);
    }
});

// Make functions available globally
window.toggleServiceStatus = async (serviceId, isActive) => {
    try {
        await updateServiceStatus(serviceId, isActive);
        await displayServices();
    } catch (error) {
        console.error('Error toggling service status:', error);
    }
};

window.updateOrderStatus = async (orderId, status) => {
    try {
        await updateOrderStatus(orderId, status);
        await displayOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
    }
};

function localDatetimeToUTC(localDatetimeString) {
    // Create a Date object from the local datetime string
    const date = new Date(localDatetimeString);
    // Convert to UTC ISO string
    return date.toISOString();
}

async function updateDeadline(orderId, deadline) {
    try {
        const response = await fetch(`/admin/orders/${orderId}/deadline`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deadline: localDatetimeToUTC(deadline) })
        });

        if (!response.ok) {
            throw new Error('Failed to update deadline');
        }
        
        // Reload orders to show updated deadline
    } catch (error) {
        console.error('Error updating deadline:', error);
        alert('Ошибка при обновлении дедлайна');
    }
} 