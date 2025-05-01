import { v4 as uuidv4 } from 'uuid';
import sqlite3Pkg from "sqlite3";
import * as path from 'path';
import * as fs from 'fs';
import * as validator from "validator";
import {__dirname} from './config.js'

const sqlite3 = sqlite3Pkg.verbose();


export class Database {
    constructor() {
        this.dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "db.sqlite");
        this.dbTableCreationScriptName = path.join(__dirname, 'create-tables.sql');
        this.db = null;
        this.initializationPromise = this.initialize();
    }

    async initialize() {
        if (!fs.existsSync(path.dirname(this.dbPath))) {
            fs.mkdirSync(path.dirname(this.dbPath));
        }

        this.db = new sqlite3.Database(this.dbPath);

        try {
            const data = await fs.promises.readFile(this.dbTableCreationScriptName, 'utf8');
            await new Promise((resolve, reject) => {
                this.db.exec(data, (err) => {
                    if (err) {
                        console.error('Error initializing database:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error('Error reading SQL script:', err);
            throw err;
        }
    }

    async query(sql, params = []) { // read
        await this.initializationPromise;
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async run(sql, params = []) { // write
        await this.initializationPromise;
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    async singleQuery(sql,params = []) {
        await this.initializationPromise;
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                }
            });
            this.db = null;
        }
    }
}

// Create a singleton instance
const database = new Database();

// Ensure the database connection is closed when the process exits
process.on('exit', () => {
    database.close();
});

export default database;
