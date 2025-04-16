import express from 'express';
import * as db from '../db.js';
import database from '../db.js';
import isMobilePhoneModule from 'validator/lib/isMobilePhone.js'
const isMobilePhone = isMobilePhoneModule.default || isMobilePhoneModule;

const router = express.Router();

router.post('/login', async (req, res) => {
    console.log(req.body);
    if (!req.body.phoneNumber || !isMobilePhone(req.body.phoneNumber, 'ru-RU')) {
        res.status(400).send('invalid phone number');
        return;
    }

    let customerId = await database.query('SELECT id FROM Customers WHERE phoneNumber = ?', [req.body.phoneNumber]);

    if (customerId === null) {
        res.status(404);
    }

    res.send(customerId);
});
export default router; 