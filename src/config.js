import dotenv from 'dotenv';
import * as path from 'path';
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const openingTime = new TimeOfDay(8, 0);
export const closingTime = new TimeOfDay(22, 0);
export {__dirname};