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
app.use('/static', express.static(path.join(__dirname, 'pages', 'static')));

app.get('/', (req, res) => {
    res.sendFile('main.html', { root: path.join(__dirname, "pages") });
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
    res.sendFile('order.html', { root: path.join(__dirname, "pages") });
});

app.post('/get-confirmation-code', async (req, res) => {
    const address = req.body.address;
    console.log(address);

    if (!isMobilePhone(address, 'ru-RU') && !isEmail(address)) {
        console.error("notAKnownMedium");
        res.status(400);
        res.send("notAKnownMedium");
        return;
    }

    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(confirmationCode);
    database.run(`INSERT INTO ConfirmationCodes (address, code) VALUES (?, ?);`, [address, confirmationCode]);
    res.status(200);
    res.send(confirmationCode);
});

app.post('/confirm-code', async (req, res) => {
    const address = req.body.address;
    const code = req.body.code;
    console.log(req.body);
    console.log(address, code);

    if (!isMobilePhone(address, 'ru-RU') && !isEmail(address)) {
        console.error("notAKnownMedium");
        res.status(400);
        res.send("notAKnownMedium");
        return;
    }

    if (code === undefined) {
        console.error("code is undefined")
        res.status(400);
        res.send("code is undefined");
    }

    const addressCodePairs = await database.query(`SELECT 1 FROM ConfirmationCodes WHERE address = ? AND code = ? LIMIT 1;`, [address, code]);
    if (addressCodePairs.length === 0) {
        res.status(400);
        res.send("invalidCode");
        console.error("invalidCode");
        return;
    }

    await database.run(`DELETE FROM ConfirmationCodes WHERE address = ?;`, [address]);
    console.log("deleted");

    res.status(200);
    res.send("confirmed");
});