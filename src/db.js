import { v4 as uuidv4 } from 'uuid';
import sqlite3Pkg from "sqlite3";
import * as path from 'path';
import * as fs from 'fs';
import * as validator from "validator";

import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmail from 'validator';

const sqlite3 = sqlite3Pkg.verbose();

const __dirname = import.meta.dirname;

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "db.sqlite");
const dbTableCreationScriptName = path.join(__dirname, 'create-tables.sql');

if (fs.existsSync(dbPath)) {
    console.log(dbPath);
    console.log('Database file already exists');
} else {
    fs.mkdirSync(path.dirname(dbPath));
}

const db = new sqlite3.Database(dbPath);

fs.readFile(dbTableCreationScriptName, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading SQL script:', err);
    } else {
        db.exec(data, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
            } else {
                console.log('Database initialized successfully');
            }
            db.close();
        });
    }
});
