import express from 'express';
import database from './db.js';
import { Address, addressType, AddressError, getAddress } from "./utilities.js";

import * as path from 'path';

const port = 3000;
const __dirname = import.meta.dirname;
const app = express();

const AddressType = Object.freeze({
    EMAIL: 1,
    PHONE: 2,
});


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

// TODO add email option and send code there
app.post('/get-confirmation-code', async (req, res) => {
    const address = getAddress(req, res);
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(confirmationCode);
    await database.run(`INSERT OR IGNORE INTO ConfirmationCodes (address, code) VALUES (?, ?);`, [address.value, confirmationCode]);
    res.status(200);
    res.send("codeIsSent");
});

app.post('/confirm-code', async (req, res) => {
    const address = getAddress(req, res);
    const code = req.body.code;

    if (code === undefined) {
        console.error("code is undefined")
        res.status(400);
        res.send("code is undefined");
    }

    console.log(address);
    const addressCodePairs = await database.query(`SELECT * FROM ConfirmationCodes WHERE address = ?;`, [address.value]);
    if (addressCodePairs.length === 0) {
        res.status(404);
        res.send("noCodesForThisAddress");
        console.log("noCodesForThisAddress");
        return;
    }

    for (const addressAndCode of addressCodePairs) {
        if (addressAndCode.code === code) {
            const deletionResult = await database.run(`DELETE FROM ConfirmationCodes WHERE address = ?;`, [address.value]);
            if (deletionResult.changes > 0) {
                console.log("deleted");
            }

            res.status(200);
            console.log("confirmed");
            res.send("confirmed");
            return;
        }
    }
    res.status(401);
    res.send("invalidCode");
});