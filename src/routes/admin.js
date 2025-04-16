import express from 'express';
import database from '../db.js';
import { v4 as uuidv4 } from 'uuid';
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


router.get('/add-customer', (req, res) => {
    res.sendFile('add-customer.html', { root: path.join(__dirname, "..", "pages") });
});

router.delete('/remove-customer', async (req, res) => {
    console.log('remove customer request:', req.body.id);
    try {
        await database.run('DELETE FROM Customers WHERE id = ?', [req.body.id]);
        res.status(200);
    } catch (error) {
        console.error(error);
        res.status(500);
    }
});

router.post('/create-parking-space', async (req, res) => {
    try {
        const { number } = req.body;

        // Check if parking space number already exists
        const existingSpace = await database.query('SELECT number FROM ParkingSpaces WHERE number = ?', [number]);
        if (existingSpace.length > 0) {
            res.status(400).send('Парковочное место с таким номером уже существует');
            return;
        }

        await database.run(
            'INSERT INTO ParkingSpaces (number, registrationNumber, orderID, occupied) VALUES (?, NULL, NULL, 0)',
            [number]
        );

        res.status(200).send('Парковочное место создано успешно');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.delete('/remove-parking-space', async (req, res) => {
    try {
        const { number } = req.body;

        // Check if parking space exists and is not occupied
        const parkingSpace = await database.query('SELECT occupied FROM ParkingSpaces WHERE number = ?', [number]);
        
        if (!parkingSpace) {
            res.status(404).send('Парковочное место не найдено');
            return;
        }

        if (parkingSpace.occupied) {
            res.status(400).send('Невозможно удалить занятое парковочное место');
            return;
        }

        await database.run('DELETE FROM ParkingSpaces WHERE number = ?', [number]);
        res.status(200).send('Парковочное место удалено успешно');

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.get('/parking-spaces', async (req, res) => {
    try {
        const parkingSpaces = await database.query('SELECT * FROM ParkingSpaces');
        res.status(200).json(parkingSpaces);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.get('/parking-spaces-management', (req, res) => {
    res.sendFile('parking-spaces-management.html', { root: path.join(__dirname, "..", "pages") });
}); 





export default router; 