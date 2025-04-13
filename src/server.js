import express from 'express';
import * as db from './db.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'pages', 'static')))


app.get('/', (req, res) => {
    res.sendFile('main.html', { root: path.join(__dirname, "pages") });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

app.post('/login', async (req, res) => {
    console.log(req.body);
    let customerId = await db.getCustomerId(req.body.phoneNumber);
    console.log(customerId);
    if (customerId === null) {
        res.status(404);
    }
    res.send()
})

app.post('/register', async (req, res) => {
    let message = "";
    try {
        await db.registerCustomer(req.body.phoneNumber, req.body.firstName);
        res.status(201);
    } catch (error) {
        res.status(401);

        if (error.message === 'no-first-name') {
            message = "no-first-name";
        } else if (error.message === 'no-phone-number') {
            message = "no-phone-number";
        }
    }
    res.send(message);
})

app.get('/services', async (req, res) => {
    try {
        res.json(await db.allServices());
        res.status(200);
    } catch (error) {
        res.status(404);
    }
    res.send();
})

// TODO: authentication
app.post('/admin/add-service', async (req, res) => {
    let message;
    let newService = req.body;
    try {
        await db.addService(newService.price, newService.name, newService.description);
        res.status(201);
    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeUniqueConstraintError") {
            message = "service already exists" + " (" + error.name + ")";
            res.status(409);
        }
    }
    res.send(message);
})

app.post('/admin/remove-service', async (req, res) => {
    let message;
    try {
        console.log('trying');
        await db.removeService(req.body.id);
        res.status(200);
    } catch (error) {
        console.error(error);
        message = error.name;
        res.status(500);
    }
    res.send(message);
})