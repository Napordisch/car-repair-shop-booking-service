import {TimeOfDay} from "./TimeOfDay.js";
import {getUserInfo} from "./userinfo.js";

const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices'));
const services = JSON.parse(sessionStorage.getItem('services'));
const currentMonth = new Date().getMonth(); // 0-indexed

const currentYear = new Date().getFullYear();
const currentDate = new Date().getDate(); // 1 indexed, like real dates
let totalServicesPrice = 0;

async function getWorkingTime() {
    let openingTime;
    let closingTime;
    await fetch('/working-time')
        .then(response => response.json())
        .then(response => {
            openingTime = response.openingTime;

            closingTime = response.closingTime;
        })
        .catch(error => {
            console.error(error);
        });
    return {openingTime: TimeOfDay.fromJSON(openingTime), closingTime: TimeOfDay.fromJSON(closingTime)};
}

function requestSMScode(phone) {
    requestConfirmationCode(phone);
}

function requestConfirmationCode(address) {
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
            if (data === 'confirmed') {
            }
        }).catch(error => {
        console.error('Error:', error);
    });
}

function addServices() {
    let list = document.getElementById("services-list");
    for (const serviceid of selectedServices) {
        const service = services[serviceid];
        totalServicesPrice += service.price;
        let serviceElement = document.createElement('tr');
        serviceElement.id = "service-" + service.id;

        serviceElement.innerHTML = `
            <td>${service.name}</td>
            <td>${service.price.toLocaleString('ru-RU')} ₽</td>
        `;

        list.appendChild(serviceElement);
    }
    let total = document.createElement('tr');

    total.innerHTML = `
            <td style="font-style: italic">Всего</td>
            <td>${totalServicesPrice.toLocaleString('ru-RU')} ₽</td>
    `;
    list.appendChild(total);

}

const months = ["Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"]


function amountOfDaysInMonth(month, year) {
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    const daysPerMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysPerMonth[month];
}

function monthHTMLList() {
    let rows = [];
    for (let i = currentMonth; i <= 11; i++) {
        rows.push(`<option value="${i}">${months[i]}</option>`);
    }
    return rows.join(`\n`);
}

// month is 0-indexed
function daysOfMonthHTMLList(month) {
    let rows = [];
    let amountOfDays = amountOfDaysInMonth(month,currentYear)
    let startingDate = parseInt(month) === parseInt(currentMonth) ? currentDate - 1 : 0;
    for (let i = startingDate; i < amountOfDays; i++) {
        rows.push(`<option value="${i}">${i+1}</option>`)
    }
    return rows.join(`\n`);
}


function updateMonthList() {
    document.getElementById('day-selector').innerHTML = daysOfMonthHTMLList(document.getElementById('month-selector').value);
}

function timeSelectorOptionsHTML(openingTime, closingTime) {
    console.log(openingTime);
    let timeList = [];
    for (let hour = openingTime.hours; hour <= closingTime.hours; hour++) {
        timeList.push(`<option value="${hour}:00">${hour}:00</option>`);
        if (hour !== closingTime.hours) {
            timeList.push(`<option value="${hour}:30">${hour}:30</option>`);
        }
    }
    return timeList.join(`\n`);
}


document.addEventListener('DOMContentLoaded', async function () {
    console.log("contentLoaded");
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    });

    let phoneForm = document.getElementsByClassName('phone-form')[0]
    console.log(phoneForm);
    phoneForm.addEventListener('submit', () => {
        requestSMScode(document.getElementById('phone').value);
    })

    let confirmationCodeForm = document.getElementsByClassName('phone-confirmation-form')[0]
    console.log(confirmationCodeForm);
    confirmationCodeForm.addEventListener('submit', () => {
        confirmCode(document.getElementById('phone').value, document.getElementById('phone-confirmation-code').value);
    })

    // addServices();

    let monthSelector = document.getElementById('month-selector')
    monthSelector.innerHTML = monthHTMLList();
    monthSelector.value = currentMonth;
    updateMonthList();

    let {openingTime, closingTime} = await getWorkingTime();
    document.getElementById('time-selector').innerHTML = timeSelectorOptionsHTML(openingTime, closingTime);
});

function createOrder() {
    let month = document.getElementById('month-selector').value;
    month = (parseInt(month)+1).toString();
    const date = document.getElementById('day-selector').value;
    let time = document.getElementById('time-selector').value;

    if (time.length < 5) {
        time = "0" + time;
    }

    if (month.length < 2) {
        month = "0" + month;
    }
    const initialVisit = currentYear.toString() + "-" + month.toString() + "-" + date.toString() + "T" + time.toString() + ":00";

    const requestBody = JSON.stringify({
        initialVisit: initialVisit,
        serviceIDs: selectedServices
    });

    fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
        },
        body: requestBody
    })
    .then((response) => {
        if (response.ok) {
            window.alert("Заказ создан");
        }
    }).catch(error => {
        console.error(error);
    })
}