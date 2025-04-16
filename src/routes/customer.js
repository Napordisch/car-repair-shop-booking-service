import express from 'express';
import * as db from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    console.log(req.body);
    let customerId = await db.getCustomerId(req.body.phoneNumber);
    console.log(customerId);
    if (customerId === null) {
        res.status(404);
    }
    res.send();
});

router.post('/register', async (req, res) => {
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
});

export default router; 