const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const amqp = require('amqplib');
require('dotenv').config();

// Import routes and services
const orderRoutes = require('./routes/orders');
const clientRoutes = require('./routes/clients');
const driverRoutes = require('./routes/drivers');
const authRoutes = require('./routes/auth');

// Import workers
const orderProcessor = require('./workers/orderProcessor');
const notificationService = require('./services/notificationService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "ws://localhost:5000"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (client portal)
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/drivers', driverRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve client portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for real-time notifications
global.io = io;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swilogistics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// RabbitMQ connection
async function connectRabbitMQ() {
  try {
    console.log('Skipping RabbitMQ connection for testing...');
    // Temporarily disable RabbitMQ to isolate the issue
    /*
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    
    // Create queues
    await channel.assertQueue('orders_to_wms');
    await channel.assertQueue('orders_to_ros'); 
    await channel.assertQueue('wms_responses');
    await channel.assertQueue('ros_responses');
    await channel.assertQueue('updates_to_clients');
    await channel.assertQueue('driver_notifications');
    
    console.log('RabbitMQ connected and queues created');
    
    // Start workers
    orderProcessor.start(channel);
    notificationService.start(channel, io);
    
    // Start simulation workers for demo
    orderProcessor.simulateWMSProcessing();
    orderProcessor.simulateROSProcessing();
    
    global.rabbitmqChannel = channel;
    */

  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    // Don't retry for now during debugging
    // setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
}

connectRabbitMQ();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`SwiLogistics Middleware Server running on port ${PORT}`);
});

module.exports = app;
