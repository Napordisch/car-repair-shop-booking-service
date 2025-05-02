import express from 'express'
import database from './db.js';
import cookieParser from "cookie-parser"
import * as path from 'path';
import {Customer} from './pages/static/js/customer.js'

import {getAddress, questionMarkPlaceholderForArray, sendPlainEmail} from "./utilities.js";
import {timeZoneOffsetInMinutes} from './utilities.js';
import * as config from './config.js'
import {deadline} from './utilities.js';
import {occupiedIntervals, findAvailableParkingSpace} from './utilities.js';

import {AddressError, MissingDataError, impossibleDataBaseConditionError, NoUsersFoundError} from "./errors.js";
import {Address, addressType, Email} from "./Address.js";
import {removeAuthToken, setAuthToken, verifyAuthToken} from "./Authentication.js";
import jwt from 'jsonwebtoken';

const port = 3000;
const app = express();

app.use(express.json());
app.use(cookieParser())

app.use('/static', express.static(path.join(config.__dirname, 'pages', 'static')));

app.get('/', (req, res) => {
    res.sendFile('main.html', { root: path.join(config.__dirname, "pages") });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

app.get('/services', async (req, res) => {
    try {
        res.status(200);
        res.json(await database.query('SELECT * FROM Services WHERE active = 1'));
    } catch (error) {
        console.error(error);
        res.status(404);
        res.send();
    }
});

app.get('/order', async (req, res) => {
    res.sendFile('order.html', { root: path.join(config.__dirname, "pages") });
});


// TODO add email option and send code there
app.post('/get-confirmation-code', async (req, res) => {
    const address = getAddress(req, res);
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(confirmationCode);
    if (address instanceof Email) {
        sendPlainEmail(address.value, confirmationCode.toString());
    }
    await database.run(`INSERT OR IGNORE INTO ConfirmationCodes (address, code) VALUES (?, ?);`, [address.value, confirmationCode]);
    res.status(200);
    res.send("codeIsSent");
});

async function registerUser(address) {
    await database.run(`INSERT INTO Customers (${address.type}) VALUES (?)`, [address.value]);
}

app.post('/confirm-code', async (req, res) => {
    const address = getAddress(req, res);
    const code = req.body.code;

    if (code === undefined) {
        console.error("code is undefined")
        res.status(400);
        res.send("code is undefined");
    }

    const addressCodePairs = await database.query(`SELECT * FROM ConfirmationCodes WHERE address = ?;`, [address.value]);
    if (addressCodePairs.length === 0) {
        res.status(404);
        res.send("noCodesForThisAddress");
        console.error("noCodesForThisAddress");
        return;
    }

    for (const addressAndCode of addressCodePairs) {
        if (addressAndCode.code === code) {
            const deletionResult = await database.run(`DELETE FROM ConfirmationCodes WHERE address = ?;`, [address.value]);
            if (deletionResult.changes > 0) {
                console.log(`deleted all codes for the user with ${address.type} ${address.value}`);
            }

            let customers = await database.query(`SELECT * FROM Customers WHERE (${address.type}) = ?;`, [address.value]);
            if (customers.length === 0) {
                await registerUser(address);
            }
            customers = await database.query(`SELECT * FROM Customers WHERE (${address.type}) = ?;`, [address.value]);

            const id = customers[0].id;
            setAuthToken(res, id);

            res.status(200);

            res.send("confirmed");

            return;
        }
    }
    res.status(401);
    res.send("invalidCode");
});

app.get('/user-information', verifyAuthToken, async (req, res) => {
    try {
        const users = await database.query(`SELECT *
                                            FROM Customers
                                            WHERE id = ?;`, [req.userId]);

        if (users.length > 1) {
            throw new impossibleDataBaseConditionError("more than 1 users with the same id found");
        }

        if (users.length < 1) {
            throw new NoUsersFoundError("no user with such id is found in database");
        }

        const theCustomer = Customer.fromJSON(users[0]);
        res.status(200);
        res.json(theCustomer);
    } catch (error) {
        console.error(error);
        res.status(400);
        res.send();
    }
});

app.get('/working-time', async (req, res) => {
    res.status(200);
    res.json({
        openingTime: config.openingTime,
        closingTime: config.closingTime,
    });
});

app.post('/create-order', verifyAuthToken, async (req, res) => {
    try {
        const selectedServicesIds = JSON.parse(req.body.selectedServices);
        const initialVisitDate = new Date(req.body.initialVisitDate);
        if (req.body.selectedServices == null) {
            res.status(400);
            res.send("noServicesProvided");
            return;
        }
        const selectedServices = await database.query(`SELECT * FROM Services WHERE id in (${questionMarkPlaceholderForArray(selectedServicesIds)})`, selectedServicesIds);
        const d = deadline(initialVisitDate, selectedServices);
        
        // Find an available parking space
        const parkingSpace = await findAvailableParkingSpace(initialVisitDate, d);
        if (parkingSpace === null) {
            res.status(400);
            res.send("noParkingSpaceAvailable");
            return;
        }
        
        // Insert the order and get its ID
        const result = await database.run(
            `INSERT INTO Orders (deadline, initialVisit, customerID, parkingSpace) VALUES (?, ?, ?, ?)`,
            [d.toISOString(), initialVisitDate.toISOString(), req.userId, parkingSpace]
        );
        
        const orderId = result.lastID;
        
        // Insert each selected service into OrderServices
        for (const serviceId of selectedServicesIds) {
            await database.run(
                `INSERT INTO OrderServices (orderID, serviceID) VALUES (?, ?)`,
                [orderId, serviceId]
            );
        }
        
        res.status(200).send();
    } catch (e) {
        console.error(e);
        res.status(400).send();
    }
})

app.post('/logout', async (req, res) => {
    try {
        removeAuthToken(res);
        res.status(200).send('logged out');
    } catch (e) {
        console.error(e);
        res.status(400).send('error logging out');
    }
})

app.get('/time-zone-offset-in-minutes', async (req, res) => {
    res.status(200);
    res.send(JSON.stringify(timeZoneOffsetInMinutes()));
})

app.post('/deadline', async (req,res) => {
    try {
        // First check if the body is properly formatted
        if (!req.body || !req.body.selectedServices || !req.body.initialVisitDate) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Parse the selected services
        const selectedServicesIds = Array.isArray(req.body.selectedServices) 
            ? req.body.selectedServices 
            : JSON.parse(req.body.selectedServices);

        // Get the services from the database
        const selectedServices = await database.query(
            `SELECT * FROM Services WHERE id in (${questionMarkPlaceholderForArray(selectedServicesIds)})`, 
            selectedServicesIds
        );

        // Calculate and return the deadline
        res.status(200).json({
            deadline: deadline(new Date(req.body.initialVisitDate), selectedServices)
        });
    } catch (error) {
        console.error('Error in /deadline endpoint:', error);
        res.status(400).json({ error: 'Invalid request data' });
    }
})

app.get('/occupied-intervals', async (req, res) => {
    try {
        const intervals = await occupiedIntervals();
        res.status(200);
        res.json(intervals);
    } catch (error) {
        console.error(error);
        res.status(500);
        res.send('Error fetching occupied intervals');
    }
})

app.get('/my-orders', verifyAuthToken, async (req, res) => {
    try {
        const orders = await database.query(`
            SELECT * FROM Orders 
            WHERE customerID = ?
            ORDER BY initialVisit DESC
        `, [req.userId]);

        // Get service IDs for each order
        const ordersWithServices = await Promise.all(orders.map(async (order) => {
            const services = await database.query(`
                SELECT serviceID FROM OrderServices 
                WHERE orderID = ?
            `, [order.id]);
            return {
                ...order,
                serviceIDs: services.map(s => s.serviceID)
            };
        }));

        res.status(200).json(ordersWithServices);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/successful-order', async (req, res) => {
    res.sendFile('successful-order.html', { root: path.join(config.__dirname, "pages") });
});

app.post('/update-customer-info', verifyAuthToken, async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        
        // Build the update query dynamically based on provided fields
        const updates = [];
        const params = [];
        
        if (firstName !== undefined) {
            updates.push('firstName = ?');
            params.push(firstName);
        }
        
        if (lastName !== undefined) {
            updates.push('lastName = ?');
            params.push(lastName);
        }
        
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        
        if (updates.length === 0) {
            res.status(400).json({ success: false, error: 'No fields to update' });
            return;
        }
        
        // Add the user ID as the last parameter
        params.push(req.userId);
        
        // Execute the update
        await database.run(
            `UPDATE Customers SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating customer info:', error);
        res.status(400).json({ success: false, error: 'Failed to update customer information' });
    }
});

app.get('/my-orders-page', async (req, res) => {
    res.sendFile('my-orders.html', { root: path.join(config.__dirname, "pages") });
});

app.delete('/my-orders/:orderId', verifyAuthToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // First verify the order belongs to the user
        const orders = await database.query(
            'SELECT * FROM Orders WHERE id = ? AND customerId = ?',
            [orderId, req.userId]
        );
        
        if (orders.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found or unauthorized' });
            return;
        }
        
        // Delete associated services first
        await database.run(
            'DELETE FROM OrderServices WHERE orderID = ?',
            [orderId]
        );
        
        // Then delete the order
        await database.run(
            'DELETE FROM Orders WHERE id = ?',
            [orderId]
        );
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(400).json({ success: false, error: 'Failed to delete order' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: path.join(config.__dirname, "pages") });
});

// Admin authentication middleware
function verifyAdmin(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).send('Authentication required');
    }

    const [type, credentials] = auth.split(' ');
    if (type !== 'Basic') {
        return res.status(401).send('Invalid authentication type');
    }

    const password = Buffer.from(credentials, 'base64').toString().split(':')[1];
    if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).send('Invalid password');
    }

    next();
}

// Protect admin routes
app.get('/admin', verifyAdmin, (req, res) => {
    res.sendFile('admin.html', { root: path.join(config.__dirname, "pages") });
});

app.get('/admin/add-service', verifyAdmin, (req, res) => {
    res.sendFile('add-service.html', { root: path.join(config.__dirname, "pages") });
});

app.get('/admin/services', verifyAdmin, async (req, res) => {
    try {
        const services = await database.query('SELECT * FROM Services');
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.patch('/admin/services/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        
        await database.run(
            'UPDATE Services SET active = ? WHERE id = ?',
            [active ? 1 : 0, id]
        );
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

app.get('/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const orders = await database.query(`
            SELECT o.*, c.firstName, c.lastName, c.phoneNumber, c.email, o.parkingSpace
            FROM Orders o
            LEFT JOIN Customers c ON o.customerID = c.id
            ORDER BY o.initialVisit DESC
        `);
        
        const ordersWithServices = await Promise.all(orders.map(async (order) => {
            const services = await database.query(`
                SELECT s.* FROM Services s
                JOIN OrderServices os ON s.id = os.serviceID
                WHERE os.orderID = ?
            `, [order.id]);
            return {
                ...order,
                services
            };
        }));
        
        res.status(200).json(ordersWithServices);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.patch('/admin/orders/:id/deadline', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { deadline } = req.body;
        
        if (!deadline) {
            res.status(400).json({ error: 'Deadline is required' });
            return;
        }
        
        await database.run(
            'UPDATE Orders SET deadline = ? WHERE id = ?',
            [deadline, id]
        );
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating order deadline:', error);
        res.status(500).json({ error: 'Failed to update order deadline' });
    }
});

app.post('/admin/services', verifyAdmin, async (req, res) => {
    try {
        const { name, price, description, durationHours, durationMinutes } = req.body;
        
        if (!name || price === undefined || !description || durationHours === undefined || durationMinutes === undefined) {
            res.status(400).json({ error: 'Name, price, description, durationHours, and durationMinutes are required' });
            return;
        }

        const durationMs = (durationHours * 60 + durationMinutes) * 60 * 1000;
        
        const result = await database.run(
            'INSERT INTO Services (name, price, description, duration, active) VALUES (?, ?, ?, ?, 1)',
            [name, price, description, durationMs]
        );
        
        res.status(201).json({ 
            id: result.lastID,
            name,
            price,
            description,
            duration: durationMs,
            active: 1
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.get('/parking-spaces', async (req, res) => {
    try {
        const result = await database.singleQuery('SELECT COUNT(*) as count FROM ParkingSpaces');
        res.status(200);
        res.send(JSON.stringify(result.count));
    } catch (error) {
        console.error('Error fetching parking spaces:', error);
        res.status(500).send('Error fetching parking spaces');
    }
});


// TODO: return forbidden times