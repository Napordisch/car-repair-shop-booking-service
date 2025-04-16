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