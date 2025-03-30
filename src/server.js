import express from 'express';
import * as db from './db.js';

const app = express();
app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
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

        if(error.message === 'no-first-name') {
            message = "no-first-name";
        }
        else if(error.message === 'no-phone-number') {
            message = "no-phone-number";
        }
    }
    res.send(message);
})