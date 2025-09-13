// Simple mock ROS REST server
const express = require('express');
const app = express();
app.use(express.json());

app.get('/ros/api', (req, res) => {
    res.json({ message: 'Mock ROS REST endpoint', data: req.query });
});

app.listen(8081, () => {
    console.log('Mock ROS server running on port 8081');
});
