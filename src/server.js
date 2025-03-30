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