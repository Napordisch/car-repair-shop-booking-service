import pkg from "cookie-parser"

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";


const {cookieParser} = pkg;

export class TimeOfDay {
    hours;
    minutes;
    seconds;

    constructor(hours, minutes, seconds = 0) {
        this.hours = parseInt(hours);
        this.minutes = parseInt(minutes);
        this.seconds = parseInt(seconds);
    }

    toStringWithoutSeconds() {
        let hoursString = this.hours.toString()
        if (hoursString.length < 2) {
            hoursString = "0" + hoursString;
        }

        let minutesString = this.minutes.toString()
        if (minutesString.length < 2) {
            minutesString = "0" + minutesString;
        }
        return hoursString + ":" + minutesString;
    }

    toString() {
        let secondsString = this.seconds.toString()
        if (secondsString.length < 2) {
            secondsString = "0" + secondsString;
        }

        return this.toStringWithoutSeconds() + ":" + secondsString;
    }

    static fromString(timeString) {
        const hoursMinutesSeconds = timeString.split(":"); //expected format : "hh:mm:ss"
        const hours = hoursMinutesSeconds[0];
        const minutes = hoursMinutesSeconds[1];
        const seconds = hoursMinutesSeconds[2];
        return new TimeOfDay(hours, minutes, seconds);
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

