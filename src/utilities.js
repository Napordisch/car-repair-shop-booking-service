import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmailModule from 'validator/lib/isEmail.js'
const isEmail = isEmailModule.default || isEmailModule;

import pkg from "cookie-parser"
const {cookieParser} = pkg;
import jwt from 'jsonwebtoken';

import {AddressError, MissingDataError} from "./errors.js";

class TimeOfDay {
    hours;
    minutes;
    constructor(hours, minutes) {
        this.hours = parseInt(hours);
        this.minutes = parseInt(minutes);
    }
}

export const openingTime = new TimeOfDay(8, 0);
export const closingTime = new TimeOfDay(22, 0);

const addressType = Object.freeze({
    EMAIL: "email",
    PHONE: "phoneNumber"
});

class Address {
    value;
    type;
    constructor(address) {
        this.value = address;
        this.type = this.determineType(this.value);
    }

    determineType(address) {
        let type;
        if (isMobilePhone(address, 'ru-RU')) {
            type = addressType.PHONE;
        } else if (isEmail(address)) {
            type = addressType.EMAIL;
        }

        else {
            throw new AddressError(`Unsupported address`);
        }
        return type;
    }
}

function getAddress(req, res) {
    try {
        return new Address(req.body.address);
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

function setAuthToken(res, userId) {
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict',
        path: '/',
    });
}

// puts userID into req
function verifyAuthToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
}

/**
 * Calculates the end time of work considering shift breaks.
 * If work extends beyond the shift end, it pauses until the next shift starts.
 * @param {string} startIsoLocal - Start time in ISO local format (e.g. '2025-04-24T08:30:00').
 * @param {number} durationMs - Work duration in milliseconds.
 * @param {number} shiftStartHour - Shift start hour (0-23).
 * @param {number} shiftStartMinute - Shift start minute (0-59).
 * @param {number} shiftEndHour - Shift end hour (0-23).
 * @param {number} shiftEndMinute - Shift end minute (0-59).
 * @returns {Date} - End time as a Date object in local time.
 */
function calculateWorkEnd(
    startIsoLocal,
    durationMs,
    shiftStartHour,
    shiftStartMinute,
    shiftEndHour,
    shiftEndMinute
) {
    // Parse the start time as local date
    const start = new Date(startIsoLocal);
    if (isNaN(start)) {
        throw new Error('Invalid startIsoLocal format');
    }

    let remaining = durationMs;
    let cursor = new Date(start);

    // Helper to set time on a date
    function setTime(date, hour, minute) {
        const d = new Date(date);
        d.setHours(hour, minute, 0, 0);
        return d;
    }

    while (remaining > 0) {
        // Determine today's shift window
        const todayShiftStart = setTime(cursor, shiftStartHour, shiftStartMinute);
        const todayShiftEnd = setTime(cursor, shiftEndHour, shiftEndMinute);

        // If before today's shift, jump to shift start
        if (cursor < todayShiftStart) {
            cursor = todayShiftStart;
        }

        // If on or after shift end, move to next day's shift start
        if (cursor >= todayShiftEnd) {
            cursor = setTime(new Date(cursor.setDate(cursor.getDate() + 1)), shiftStartHour, shiftStartMinute);
            continue;
        }

        // Compute available time in this shift
        const available = todayShiftEnd - cursor;
        if (remaining <= available) {
            // Finish within this shift
            cursor = new Date(cursor.getTime() + remaining);
            remaining = 0;
            break;
        }

        // Use up the rest of the shift and move to next day
        remaining -= available;
        cursor = setTime(new Date(cursor.setDate(cursor.getDate() + 1)), shiftStartHour, shiftStartMinute);
    }

    return cursor; // Return Date object
}

function toLocalISOString(date = new Date()) {
    const pad = (n, width = 2) => String(n).padStart(width, '0');

    const year    = date.getFullYear();
    const month   = pad(date.getMonth() + 1);
    const day     = pad(date.getDate());
    const hours   = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms      = pad(date.getMilliseconds(), 3);

    // timezoneOffset is in minutes *behind* UTC, so we invert the sign
    const offsetMin = -date.getTimezoneOffset();
    const sign      = offsetMin >= 0 ? '+' : '-';
    const offsetH   = pad(Math.floor(Math.abs(offsetMin) / 60));
    const offsetM   = pad(Math.abs(offsetMin) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetH}:${offsetM}`;
}

// Example usage:
// console.log(calculateWorkEnd('2025-04-24T15:30:00', 5 * 60 * 60 * 1000, 8, 0, 17, 0)); // expected pause at 17:00



export {Address, addressType, getAddress, setAuthToken, verifyAuthToken, calculateWorkEnd, toLocalISOString};
