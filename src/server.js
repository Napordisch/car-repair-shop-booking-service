import express from 'express';
import adminRouter from './routes/admin.js';
import customerRouter from './routes/customer.js';
import * as services from './services.js';

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
        res.json(await services.getAllServices());
    } catch (error) {
        console.error(error);
        res.status(404);
        res.send();
    }
});

// Mount feature-specific routes
app.use('/', customerRouter);  // Customer-specific routes
app.use('/admin', adminRouter); // Admin-specific routes