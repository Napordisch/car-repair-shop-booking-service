import dotenv from 'dotenv';
import * as path from 'path';
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// set in UTC
export const openingTime = new TimeOfDay(3, 0);
export const closingTime = new TimeOfDay(17, 0);
export const port = 3000;

export const sslOptions = {
    key: readFileSync(`${__dirname}/../certs/key.pem`),
    cert: readFileSync(`${__dirname}/../certs/cert.pem`),
};

console.log("Time zone:", process.env.TZ);

export {__dirname};