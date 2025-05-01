import pkg from "cookie-parser"

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
import {hoursFromMinutes} from "./pages/static/js/TimeUtilities.js";
import {openingTime, closingTime} from "./config.js";

const {cookieParser} = pkg;

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
    const totalDuration = servicesDuration(services);
    let deadline = new Date(initialVisitDate.getTime() + totalDuration);
    return deadline;
}

export function questionMarkPlaceholderForArray(array) {
    return array.map(() => '?').join(',');
}