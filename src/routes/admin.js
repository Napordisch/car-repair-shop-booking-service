import express from 'express';
import database from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { addCustomer } from '../shared-management.js';
import path from 'path';
const __dirname = import.meta.dirname;
const router = express.Router();

// TODO: authentication
router.post('/add-service', async (req, res) => {
    let message;
    let newService = req.body;
    try {
        const id = uuidv4();
        await database.run(
            'INSERT INTO Services (id, price, name, description, duration) VALUES (?, ?, ?, ?, ?)',
            [id, newService.price, newService.name, newService.description, newService.duration]
        );
        res.status(201);
    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE constraint failed')) {
            message = "service already exists";
            res.status(409);
        }
    }
    res.send(message);
});

router.post('/remove-service', async (req, res) => {
    let message;
    try {
        console.log('trying to remove service', req.body.id);
        await database.run('DELETE FROM Services WHERE id = ?', [req.body.id]);
        res.status(200);
    } catch (error) {
        console.error(error);
        message = error.message;
        res.status(500);
    }
    res.send(message);
});

router.post('/add-customer', async (req, res) => {
    let message;
    try {
        await addCustomer(req.body);
        res.status(201);
    } catch (error) {
        console.error(error);
        message = error.message;
        if (message === 'phone number already exists') {
            res.status(409);
        } else {
            res.status(500);
        }
    }
    res.send(message);
});

router.get('/services-management', (req, res) => {
    res.sendFile('services-management.html', { root: path.join(__dirname, "..", "pages") });
});

router.get('/add-service', (req, res) => {
    res.sendFile('add-service.html', { root: path.join(__dirname, "..", "pages") });
});

router.get('/customers-management', (req, res) => {
    res.sendFile('customers-management.html', { root: path.join(__dirname, "..", "pages") });
});

router.get('/customers', async (req, res) => {
    const customers = await database.query('SELECT * FROM Customers');
    res.json(customers);
});




export default router; 