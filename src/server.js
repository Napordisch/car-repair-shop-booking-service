import express from 'express';
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
    res.sendFile('order.html', { root: path.join(__dirname, "pages") });
})

app.post('/get-confirmation-code', async (req, res) => {
    const phone = req.body.phone;
    console.log(phone);

    if (!isMobilePhone(phone, 'ru-RU')) {
        console.error("notAPhoneNumber");
        res.status(400);
        res.send("notAPhoneNumber");
        return;
    }
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(confirmationCode);
    res.status(200);
    res.send(confirmationCode);
})