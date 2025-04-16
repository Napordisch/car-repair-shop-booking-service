import express from 'express';
import adminRouter from './routes/admin.js';
import customerRouter from './routes/customer.js';
import database from './db.js';
import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;
import isEmailModule from 'validator/lib/isEmail.js'
const isEmail = isEmailModule.default || isEmailModule;
import { v4 as uuidv4 } from 'uuid';

import * as path from 'path';

const port = 3000;
const __dirname = import.meta.dirname;
const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'pages', 'static')))

app.get('/', (req, res) => {
    res.sendFile('main.html', { root: path.join(__dirname, "pages") });
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

// Core routes accessible to all
app.get('/services', async (req, res) => {
    try {
        res.status(200);
        res.json(await database.query('SELECT * FROM Services'));
    } catch (error) {
        console.error(error);
        res.status(404);
        res.send();
    }
});

// Mount feature-specific routes
app.use('/', customerRouter);  // Customer-specific routes
app.use('/admin', adminRouter); // Admin-specific routes


app.post('/register', async (req, res) => {
    console.log("register request:", req.body);
    let message;
    let type;
    try {
        console.log("checking firstname");
        if (!req.body.firstName) {
            throw new Error('firstName is required');
        }
        console.log("checking phone number");   
        if (!req.body.phoneNumber) {
            throw new Error('phoneNumber is required');
        }

        // Validate phone number format
        console.log("validating phone number");
        if (!isMobilePhone(req.body.phoneNumber, 'ru-RU')) {
            throw new Error('invalid phone number format');
        }

        // Validate email if provided
        if (req.body.email && !isEmail(req.body.email)) {
            console.log("validating email");
            throw new Error('invalid email format');
        }

        const { firstName, lastName, phoneNumber, email } = req.body;
        const id = uuidv4();

        try {
            console.log("inserting customer into database");
            await database.run(
                'INSERT INTO Customers (id, firstName, lastName, phoneNumber, email) VALUES (?, ?, ?, ?, ?)',
                [id, firstName, lastName || null, phoneNumber, email || null]
            );
            res.status(201);
        } catch (error) {
            console.log("error inserting customer into database");
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('phone number already exists');
                console.error(error);
            }
            throw error;
        }
    } catch (error) {
        console.error(error.message, ":", req.body);
        message = error.message;
        if (message === 'phone number already exists') {
            type = 'DUPLICATE_PHONE';
            res.status(409);
        } else if (message === 'invalid phone number format') {
            type = 'INVALID_PHONE';
            res.status(400);
        } else if (message === 'invalid email format') {
            type = 'INVALID_EMAIL';
            res.status(400);
        } else if (message === 'firstName is required') {
            type = 'MISSING_FIRST_NAME';
            res.status(400);
        } else if (message === 'phoneNumber is required') {
            type = 'MISSING_PHONE';
            res.status(400);
        } else {
            type = 'UNKNOWN';
            res.status(500);
        }
    }
    res.send({ message, type });
});

app.post('/occupy-parking-space', async (req, res) => {
    let message;
    let type;
    try {
        const { number, registrationNumber, orderID } = req.body;

        // Check if parking space exists
        const parkingSpace = await database.query('SELECT occupied FROM ParkingSpaces WHERE number = ?', [number]);
        if (!parkingSpace.length) {
            throw new Error('parking space not found');
        }

        // Check if parking space is already occupied
        if (parkingSpace[0].occupied) {
            throw new Error('parking space already occupied');
        }

        // Update parking space
        await database.run(
            'UPDATE ParkingSpaces SET registrationNumber = ?, orderID = ?, occupied = 1 WHERE number = ?',
            [registrationNumber, orderID, number]
        );
        res.status(200);

    } catch (error) {
        console.error(error.message);
        message = error.message;
        if (message === 'parking space not found') {
            type = 'NOT_FOUND';
            res.status(404);
        } else if (message === 'parking space already occupied') {
            type = 'ALREADY_OCCUPIED';
            res.status(409);
        } else {
            type = 'UNKNOWN';
            res.status(500);
        }
    }
    res.send({ message, type });
});



app.post('/create-order', async (req, res) => {
    try {
        const { customerId, services, parkingSpaceNumber, initialVisit, deadline } = req.body;

        const missingFields = [];
        if (!customerId) missingFields.push('customerId');
        if (!services || !services.length) missingFields.push('services');
        if (!initialVisit) missingFields.push('initialVisit'); 
        if (!deadline) missingFields.push('deadline');

        if (missingFields.length > 0) {
            res.status(400).send(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Check if customer exists
        const customer = (await database.query('SELECT id FROM Customers WHERE id = ?', [customerId]))[0];
        if (!customer) {
            res.status(404).send('Customer not found');
            return;
        }

        // Check if parking space exists and is available
        if (parkingSpaceNumber) {
            const parkingSpace = (await database.query('SELECT occupied FROM ParkingSpaces WHERE number = ?', [parkingSpaceNumber]))[0];
            if (!parkingSpace) {
                res.status(404).send('Parking space not found');
                return;
            }
            if (parkingSpace.occupied) {
                res.status(400).send('Parking space is already occupied');
                return;
            }
        }

        // Generate UUID for order
        const orderId = crypto.randomUUID();

        // Create order
        await database.run(
            'INSERT INTO Orders (id, customerID, initialVisit, deadline, services) VALUES (?, ?, ?, ?, ?)',
            [orderId, customerId, initialVisit, deadline, services]
        );

        // If parking space specified, mark it as occupied
        if (parkingSpaceNumber) {
            await database.run(
                'UPDATE ParkingSpaces SET occupied = 1, orderID = ? WHERE number = ?',
                [orderId, parkingSpaceNumber]
            );
        }

        res.status(201).json({ orderId });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


