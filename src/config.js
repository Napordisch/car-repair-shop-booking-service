import dotenv from 'dotenv';
import * as path from 'path';
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// set in UTC
export const openingTime = new TimeOfDay(3, 0);
export const closingTime = new TimeOfDay(17, 0);

console.log("Time zone:", process.env.TZ);

export {__dirname};