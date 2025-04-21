const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices'));
const services = JSON.parse(sessionStorage.getItem('services'));

console.log(selectedServices);
console.log(services);


function requestConfirmationCode(phone) {
    console.log(phone);
    fetch('/get-confirmation-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}