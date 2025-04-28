import pkg from "cookie-parser"

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";


const {cookieParser} = pkg;

export class TimeOfDay {
    hours;
    minutes;

    constructor(hours, minutes) {
        this.hours = parseInt(hours);
        this.minutes = parseInt(minutes);
    }

    toString() {
        let minutesString = this.minutes.toString()
        if (minutesString.length < 2) {
            minutesString = "0" + minutesString;
        }
        return this.hours + ":" + minutesString;
    }
}

export const openingTime = new TimeOfDay(8, 0);
export const closingTime = new TimeOfDay(22, 0);

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
        throw error;
    }
}

