import database from './db.js';

export async function getAllServices() {
    try {
        return await database.query('SELECT * FROM Services');
    } catch (error) {
        throw error;
    }
} 