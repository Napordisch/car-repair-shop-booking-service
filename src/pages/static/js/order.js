import {TimeOfDay} from "./TimeOfDay.js";
import {getUserInfo} from "./userinfo.js";
import {hoursFromMinutes} from "./TimeUtilities.js";

async function selectedServices() {
    return JSON.parse(sessionStorage.getItem('selectedServices'));
}

async function services() {
    return JSON.parse(sessionStorage.getItem('services'));
}

const currentMonth = () => new Date().getMonth(); // 0-indexed

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


async function timeZoneOffsetInHours() {
    return hoursFromMinutes(await fetch('/time-zone-offset-in-minutes').then((response) => response.json()));
}

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

async function login(address, code) {
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
        displayUserInfoIfLoggedIn();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateSelectedServicesList() {
    totalServicesPrice = 0;
    let list = document.getElementById("services-list");
    for (const serviceid of await selectedServices()) {
        const service = (await services())[serviceid];
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

async function monthHTMLList(disabledMonths = []) {
    let rows = [];
    for (let i = currentMonth(); i <= 11; i++) {
        rows.push(`<option value="${i}">${months[i]}</option>`);
    }
    return rows.join(`\n`);
}

async function daysOfMonthListHTML(month, disabledDays = []) {
    let rows = [];
    let amountOfDays = amountOfDaysInMonth(month,currentYear)
    let startingDate = parseInt(month) === parseInt(currentMonth()) ? currentDate : 1;
    for (let i = startingDate; i < amountOfDays; i++) {
        rows.push(`<option value="${i}">${i}</option>`)
    }
    return rows.join(`\n`);
}

async function timeSelectorOptionsHTML(openingTime, closingTime, disabledTimes=[]) {
    let timeList = [];
    const offset = await timeZoneOffsetInHours();
    for (let hour = openingTime.hours; hour <= closingTime.hours; hour++) {
        timeList.push(`<option value="${hour}:00">${hour + offset}:00</option>`);
        if (hour !== closingTime.hours) {
            timeList.push(`<option value="${hour}:30">${hour + offset}:30</option>`);
        }
    }
    return timeList.join(`\n`);
}

async function customerInfoElementHTML(customer) {
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
    lines.push(`<button id="logout-button" onclick="logout()">
                     ${customer.firstName != null ?
                     "Я не " + customer.firstName 
                    : "Забронировать от другого имени"} 
                </button>`)

    return lines.join('\n');
}
async function addPhoneConfirmationForm () {
    const phoneConfirmationForm = `
        <input placeholder="Номер телефона" id="phone-number">
        <button id="request-code-button">Запросить код</button>
        <input type="text" id="confirmation-code" placeholder="Код">
        
        <button id="confirm-code-button">Подтвердить код</button>
    `

    document.getElementById('login').innerHTML = phoneConfirmationForm;

    document.getElementById("request-code-button").addEventListener("click",() => {
        requestConfirmationCode(document.getElementById('phone-number').value)
    });

    document.getElementById("confirm-code-button").addEventListener("click",() => {
        login(document.getElementById('phone-number').value, document.getElementById('confirmation-code').value)
    });
}

async function displayUserInfo() {
    document.getElementById('login').innerHTML = await customerInfoElementHTML(await getUserInfo());
    document.getElementById('logout-button').addEventListener('click', logout)
}

async function displayUserInfoIfLoggedIn() {
    try {
        await displayUserInfo()
    } catch (error) {
        console.error(error)
        await addPhoneConfirmationForm();
    }
}

async function logout() {
    try {
        await fetch('/logout', {method: 'POST'});
        displayUserInfoIfLoggedIn();
    } catch (error) {
        console.error(error);
    }
}

async function buildDatePicker(disabledDateTimes = []) {
    async function buildMonthPicker() {
        const monthSelector = document.getElementById('month-selector');
        monthSelector.innerHTML = await monthHTMLList();
        monthSelector.addEventListener('change', () => {
            buildDayPicker();
        })
    }

    async function buildDayPicker(disabledDays = []) {
        const daySelector = document.getElementById('day-selector')
        daySelector.innerHTML = await daysOfMonthListHTML(document.getElementById('month-selector').value);
        daySelector.addEventListener('change', () => {
            buildTimePicker();
        })
    }

    async function buildTimePicker(disabledTimes = []) {
        let {openingTime, closingTime} = await workingTime();
        const timeSelector = document.getElementById('time-selector');
        timeSelector.innerHTML = await timeSelectorOptionsHTML(openingTime, closingTime);
    }

    await buildMonthPicker();
    await buildDayPicker();
    await buildTimePicker();
    initialVisitDate();
}

function preventReloadingOnSubmit() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    });
}

async function createOrder(selectedServices, date) {
    fetch('/create-order', {
            method: 'POST',
            body: JSON.stringify({
                selectedServices: selectedServices,
                initialVisitDate: date
            }),
            headers: {
                'Content-type': 'application/json'
            }
        }
    ).catch(err=>{console.error(err)});
}

async function initialVisitDate() {
    const day = document.getElementById('day-selector').value;
    const month = document.getElementById('month-selector').value;
    const time = TimeOfDay.fromString(document.getElementById('time-selector').value);
    let date = new Date(Date.UTC(currentYear, month, day, time.hours, time.minutes,time.seconds));
    return date;
}

document.addEventListener('DOMContentLoaded', async () => {
    displayUserInfoIfLoggedIn().catch((error) => {console.error(error)});
    buildDatePicker().catch((error) => {console.error(error)});
    updateSelectedServicesList().catch((error) => {console.error(error)});
    document.getElementById('order-button').addEventListener('click', async() => {
        await createOrder(sessionStorage.getItem("selectedServices"), await initialVisitDate());
    })
});
