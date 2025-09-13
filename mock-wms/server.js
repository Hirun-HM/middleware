// Simple mock WMS TCP server
const net = require('net');
const PORT = 9092;

const server = net.createServer(socket => {
    socket.on('data', data => {
        socket.write(`Echo from WMS: ${data}`);
    });
    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Mock WMS TCP server running on port ${PORT}`);
});
