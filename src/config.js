import dotenv from 'dotenv';
import * as path from 'path';
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export {__dirname};