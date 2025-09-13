// Simple mock CMS server
const express = require('express');
const app = express();
app.use(express.json());

app.post('/cms/soap', (req, res) => {
    res.json({ message: 'Mock CMS SOAP endpoint', data: req.body });
});

app.listen(8080, () => {
    console.log('Mock CMS server running on port 8080');
});
