const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices'));
const services = JSON.parse(sessionStorage.getItem('services'));

console.log(selectedServices);
console.log(services);
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    });
});

function requestSMScode(phone) {
    sessionStorage.setItem('phone', phone);
    requestConfirmationCode(phone);
}

function requestConfirmationCode(address) {
    console.log(address);
    fetch('/get-confirmation-code', {
        method: 'POST',
        body: JSON.stringify({ address }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function confirmCode(address, code) {

    fetch(`/confirm-code`, {
        method: 'POST',

        body: JSON.stringify({
            address: address,
            code: code
        }),

        headers: { 'Content-Type': 'application/json' }
    }).then(response => response.text())
        .then(data => {
            console.log(data);
            if (data === 'confirmed') {
                console.log(data);
                sessionStorage.setItem('confirmed', 'true');
            }
        }).catch(error => {
            console.error('Error:', error);
            sessionStorage.setItem('confirmed', 'false');
        });
}