import pkg from "cookie-parser"

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
import {hoursFromMinutes} from "./pages/static/js/TimeUtilities.js";
import {openingTime, closingTime} from "./config.js";
const {cookieParser} = pkg;

export function msFromHours(hours, minutes, seconds) {
    let ms = hours * 60 * 60 * 1000
    if (minutes) {
        ms += minutes * 60 * 1000;
    }
    if (seconds) {
        ms += seconds * 1000;
    }
    console.log(ms);
    return ms;
}
export function hoursFromMs(ms) {
    return ms / 60 / 60 / 1000;
}

export function notWorkingTime() {
    let delta =  msFromHours(openingTime.hours, openingTime.minutes, openingTime.seconds) - msFromHours(closingTime.hours, closingTime.minutes, closingTime.seconds);
    if (delta < 0) {
        delta = msFromHours(24) + delta;
    }
    return delta;
}

export function getAddress(req, res) {
    try {
        return Address.create(req.body.address);
    } catch (error) {
        console.error(error);
        if (error instanceof AddressError) {
            console.error(error);
            res.status(400);
            res.send(error.message);
            return null;
        }
    }
}

export function timeZoneOffsetInMinutes() {
    const offset = (new Date).getTimezoneOffset();
    return -offset;
}

export function servicesDuration(services){
    let totalDuration = 0;
    for (let service of services) {
        totalDuration += service.duration;
    }
    return totalDuration;
}

export function deadline(initialVisit, services) {
    const initialVisitDate = initialVisit instanceof Date ? initialVisit : new Date(initialVisit);
    let totalDuration = servicesDuration(services);
    console.log(totalDuration);
    let deadline = new Date(initialVisitDate.getTime() + totalDuration);
    console.log(deadline);

    let closingTimeThisDay = new Date(
        Date.UTC(initialVisitDate.getUTCFullYear(),
            initialVisitDate.getUTCMonth(),
            initialVisitDate.getUTCDate(),
            closingTime.hours,
            closingTime.minutes,
            closingTime.seconds));

    while (deadline > closingTimeThisDay) {
        console.log(notWorkingTime());
        deadline.setTime(deadline.getTime() + notWorkingTime()) ;
        closingTimeThisDay.setUTCDate(closingTimeThisDay.getUTCDate() + 1);
    }
    console.log(typeof deadline);
    console.log(deadline);
    return deadline;
}

export function questionMarkPlaceholderForArray(array) {
    return array.map(() => '?').join(',');
}