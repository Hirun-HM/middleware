const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'SwiLogistics API is running' });
});

app.listen(PORT, () => {
    console.log(`SwiLogistics API running on port ${PORT}`);
});
