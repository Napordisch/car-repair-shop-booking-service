import {TimeOfDay} from "./TimeOfDay.js";
import {getUserInfo} from "./userinfo.js";

const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices'));
const services = JSON.parse(sessionStorage.getItem('services'));
const currentMonth = new Date().getMonth(); // 0-indexed

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


const currentYear = new Date().getFullYear();
const currentDate = new Date().getDate(); // 1 indexed, like real dates
let totalServicesPrice = 0;


async function workingTime() {
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

async function requestConfirmationCode(address) {
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

async function confirmCode(address, code) {
    try {
        await fetch(`/confirm-code`, {
            method: 'POST',

            body: JSON.stringify({
                address: address,
                code: code
            }),

            headers: {'Content-Type': 'application/json'}
        }).then(response => response.text())
            .then(data => {
                if (data === 'confirmed') {
                }
            }).catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateServices() {
    totalServicesPrice = 0;
    let list = document.getElementById("services-list");
    for (const serviceid of selectedServices) {
        const service = services[serviceid];
        totalServicesPrice += parseInt(service.price);
        list.insertAdjacentHTML('beforeend', `
            <tr id='service-${service.id}'>
                <td>${service.name}</td>
                <td>${service.price.toLocaleString('ru-RU')} ₽</td>
            </tr>`)
    }

    list.insertAdjacentHTML('beforeend', `
    <tr>
        <td style="font-style: italic">Всего</td>
        <td>${totalServicesPrice.toLocaleString('ru-RU')} ₽</td>
    </tr>
    `);
}

function amountOfDaysInMonth(month, year) {
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    const daysPerMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysPerMonth[month];
}

async function monthHTMLList() {
    let rows = [];
    for (let i = currentMonth; i <= 11; i++) {
        rows.push(`<option value="${i}">${months[i]}</option>`);
    }
    return rows.join(`\n`);
}

// month is 0-indexed
async function daysOfMonthHTMLList(month) {
    let rows = [];
    let amountOfDays = amountOfDaysInMonth(month,currentYear)
    let startingDate = parseInt(month) === parseInt(currentMonth) ? currentDate - 1 : 0;
    for (let i = startingDate; i < amountOfDays; i++) {
        rows.push(`<option value="${i}">${i+1}</option>`)
    }
    return rows.join(`\n`);
}

async function updateMonthList() {
    document.getElementById('day-selector').innerHTML = daysOfMonthHTMLList(document.getElementById('month-selector').value);
}

async function timeSelectorOptionsHTML(openingTime, closingTime) {
    let timeList = [];
    for (let hour = openingTime.hours; hour <= closingTime.hours; hour++) {
        timeList.push(`<option value="${hour}:00">${hour}:00</option>`);
        if (hour !== closingTime.hours) {
            timeList.push(`<option value="${hour}:30">${hour}:30</option>`);
        }
    }
    return timeList.join(`\n`);
}

async function customerInfoElement(customer) {
    let lines = []
    if (customer.firstName != null) {
        lines.push(`<p>Вы: ${customer.firstName} ${customer.lastName != null ? customer.lastName : ""}</p>`);
    }
    if (customer.phoneNumber != null) {
        lines.push(`<p>Ваш номер телефона: ${customer.phoneNumber}</p>`);
    }
    if (customer.email != null) {
        lines.push(`<p>Ваша почта: ${customer.email}</p>`);
    }
    if (customer.email != null) {
        lines.push(`<p>Ваша почта: ${customer.email}</p>`);
    }
    lines.push(`<button id="logout-button" onclick="logout()">
                     ${customer.firstName != null ?
                     "Я не " + customer.firstName 
                    : "Забронировать от другого имени"} 
                </button>`)

    return lines.join('\n');
}
async function addPhoneConfirmationForm () {
    const phoneConfirmationForm = `
        <input placeholder="Номер телефона" id="phone-number"></input>
        <button id="request-code-button">Запросить код</button>
        <input type="text" id="confirmation-code" placeholder="Код"></input>
        
        <button id="confirm-code-button">Подтвердить код</button>
    `

    document.getElementById('login').innerHTML = phoneConfirmationForm;

    document.getElementById("request-code-button").addEventListener("click",() => {
        requestConfirmationCode(document.getElementById('phone-number').value)
    });

    document.getElementById("confirm-code-button").addEventListener("click",() => {
        confirmCode(document.getElementById('phone-number').value, document.getElementById('confirmation-code').value)
    });
}

async function displayUserInfo() {
    document.getElementById('login').innerHTML = await customerInfoElement(await getUserInfo());
    document.getElementById('logout-button').addEventListener('click', logout)
}

async function displayUserInfoIfLoggedIn() {
    try {
        await displayUserInfo()
    } catch (error) {
        console.error(error)
        await addPhoneConfirmationForm();
    };
}

async function logout() {
    try {
        await fetch('/logout', {method: 'POST'});
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', displayUserInfoIfLoggedIn);

function preventReloadingOnSubmit() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    });
}