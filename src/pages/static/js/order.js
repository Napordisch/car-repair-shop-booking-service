const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices'));
const services = JSON.parse(sessionStorage.getItem('services'));
const currentMonth = new Date().getMonth(); // 0-indexed
const currentYear = new Date().getFullYear();
const currentDate = new Date().getDate(); // 1 indexed, like real dates
console.log(currentMonth);
console.log(currentYear);
console.log(currentDate);


class DateClass{
    year;
    month;
    day;
    constructor(year, month, day){
        this.year = year;
        this.month = month;
        this.day = day;
    }
}

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
                sessionStorage.setItem('confirmed', 'true');
            }
        }).catch(error => {
            console.error('Error:', error);
            sessionStorage.setItem('confirmed', 'false');
        });
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

document.addEventListener('DOMContentLoaded', function () {
    let monthSelector = document.getElementById('month-selector')
    monthSelector.innerHTML = monthHTMLList();
    monthSelector.value = currentMonth;
    updateMonthList();
});