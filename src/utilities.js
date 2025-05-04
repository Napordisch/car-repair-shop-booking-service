import pkg from "cookie-parser"
import nodemailer from 'nodemailer'

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
import {hoursFromMinutes} from "./pages/static/js/TimeUtilities.js";
import {openingTime, closingTime} from "./config.js";
import database from './db.js';
const {cookieParser} = pkg;

export function devConsoleLog(value) {
    if (process.env.NODE_ENV === 'development') {
        console.log(value);
    }
}

export function msFromHours(hours, minutes, seconds) {
    let ms = hours * 60 * 60 * 1000
    if (minutes) {
        ms += minutes * 60 * 1000;
    }
    if (seconds) {
        ms += seconds * 1000;
    }
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
    const normalizedServices = Array.isArray(services) ? services : [services];
    for (let service of normalizedServices) {
        totalDuration += service.duration;
    }
    return totalDuration;
}

export function deadline(initialVisit, services) {
    const initialVisitDate = initialVisit instanceof Date ? initialVisit : new Date(initialVisit);
    let totalDuration = servicesDuration(services);
    let deadline = new Date(initialVisitDate.getTime() + totalDuration);

    let closingTimeThisDay = new Date(
        Date.UTC(initialVisitDate.getUTCFullYear(),
            initialVisitDate.getUTCMonth(),
            initialVisitDate.getUTCDate(),
            closingTime.hours,
            closingTime.minutes,
            closingTime.seconds));

    while (deadline > closingTimeThisDay) {
        deadline.setTime(deadline.getTime() + notWorkingTime()) ;
        closingTimeThisDay.setUTCDate(closingTimeThisDay.getUTCDate() + 1);
    }
    return deadline;
}

export function questionMarkPlaceholderForArray(array) {
    const normalized = Array.isArray(array) ? array : [array];
    return normalized.map(() => '?').join(',');
}

export async function amountOfParkingSpaces() {
    const amountOfParkingSpaces = await database.singleQuery(`SELECT COUNT(*) AS count FROM ParkingSpaces`);
    return amountOfParkingSpaces.count;
}

export async function getAllOrders() {
    return await database.query(`SELECT * FROM Orders`);
}
 export async function occupiedIntervals() {
    const parkingSpacesAmount = await amountOfParkingSpaces();
    const orders = await getAllOrders();
    const events = [];

    orders.forEach((o) => {
        events.push({time: new Date(o.initialVisit), type: +1, spot: o.parkingSpace});
        events.push({time: new Date(o.deadline), type: -1, spot: o.parkingSpace});
    });

    events.sort((a, b) => a.time - b.time || a.type - b.type);
    const occupied = new Set();
    let currentIntervalStart = null;
    const result = [];

    events.forEach(ev => {
        if (ev.type === +1) {
            occupied.add(ev.spot);
        } else {
            occupied.delete(ev.spot);
        }
        if (occupied.size === parkingSpacesAmount) {
            if (currentIntervalStart === null) {
                currentIntervalStart = ev.time;
            }
        } else {
            if (currentIntervalStart !== null) {
                result.push( {start: currentIntervalStart, end: ev.time});
                currentIntervalStart = null;
            }
        }
    });
    return result;
}

export async function findAvailableParkingSpace(initialVisit, deadline) {
    try {
        // Get all parking spaces
        const allSpaces = await database.query('SELECT number FROM ParkingSpaces');
        
        // Get all orders
        const allOrders = await database.query(`
            SELECT parkingSpace, initialVisit, deadline 
            FROM Orders 
            ORDER BY initialVisit ASC
        `);
        
        // Create a set of occupied spaces
        const occupiedSpaces = new Set();
        
        // Check each order for overlap
        for (const order of allOrders) {
            const orderStart = new Date(order.initialVisit);
            const orderEnd = new Date(order.deadline);
            
            // Check if the intervals overlap
            if (
                (initialVisit.getTime() <= orderEnd.getTime() && deadline.getTime() >= orderStart.getTime()) || // Our interval overlaps with the order
                (orderStart.getTime() <= deadline.getTime() && orderEnd.getTime() >= initialVisit.getTime())    // Order overlaps with our interval
            ) {
                occupiedSpaces.add(order.parkingSpace);
            }
        }
        
        // Find the first available space
        for (const space of allSpaces) {
            if (!occupiedSpaces.has(space.number)) {
                return space.number;
            }
        }
        
        // If no space is available, return null
        return null;
    } catch (error) {
        console.error('Error finding available parking space:', error);
        return null;
    }
}

export async function sendPlainEmail(to, text) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: `"Автосервис" <${process.env.SMTP_USER}>`,
            to: to,
            subject: 'Код подтверждения',
            text: text,
            replyTo: process.env.SMTP_USER
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}