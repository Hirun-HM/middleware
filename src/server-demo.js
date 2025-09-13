const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes and services
const orderRoutes = require('./routes/orders');
const clientRoutes = require('./routes/clients');
const driverRoutes = require('./routes/drivers');
const authRoutes = require('./routes/auth');

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
    uptime: process.uptime(),
    mode: 'DEMO_MODE',
    services: {
      mongodb: 'Connected',
      rabbitmq: 'Demo Mode (Mock)',
      websocket: 'Active'
    }
  });
});

// Serve client portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Demo API endpoint for quick testing
app.get('/api/demo/status', (req, res) => {
  res.json({
    success: true,
    message: 'SwiLogistics Middleware Demo is running!',
    architecture: {
      gateway: 'Node.js + Express.js',
      database: 'MongoDB',
      messaging: 'RabbitMQ (Demo Mode)',
      realtime: 'Socket.IO',
      integration: 'CMS (SOAP) + ROS (REST) + WMS (TCP)'
    },
    demo_credentials: {
      client1: { id: 'CLI-001', key: 'techshop_api_key_123' },
      client2: { id: 'CLI-002', key: 'fashionhub_api_key_789' }
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Send welcome message
    socket.emit('systemUpdate', {
      message: `Connected to SwiLogistics real-time updates`,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for real-time notifications
global.io = io;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swilogistics')
.then(() => {
  console.log('✅ MongoDB connected');
  
  // Create sample data if needed
  createSampleData();
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create sample data for demo
async function createSampleData() {
  try {
    const Client = require('./models/Client');
    const Driver = require('./models/Driver');
    
    // Check if data already exists
    const clientCount = await Client.countDocuments();
    if (clientCount > 0) {
      console.log('📋 Sample data already exists');
      return;
    }
    
    // Create sample clients
    const sampleClients = [
      {
        clientId: 'CLI-001',
        companyName: 'TechShop Electronics',
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah@techshop.lk',
          phone: '+94112345678'
        },
        address: {
          street: '123 Galle Road',
          city: 'Colombo',
          postalCode: '00300',
          country: 'Sri Lanka'
        },
        contractDetails: {
          contractId: 'CNT-001',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          billingType: 'per_delivery',
          rates: {
            baseRate: 500,
            perKmRate: 25,
            weightMultiplier: 50
          }
        },
        status: 'active',
        apiCredentials: {
          apiKey: 'techshop_api_key_123',
          secretKey: 'techshop_secret_xyz'
        }
      },
      {
        clientId: 'CLI-002',
        companyName: 'Fashion Hub',
        contactPerson: {
          name: 'Priya Patel',
          email: 'priya@fashionhub.lk',
          phone: '+94117654321'
        },
        address: {
          street: '456 Kandy Road',
          city: 'Kandy',
          postalCode: '20000',
          country: 'Sri Lanka'
        },
        contractDetails: {
          contractId: 'CNT-002',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-12-31'),
          billingType: 'volume_based',
          rates: {
            baseRate: 400,
            perKmRate: 20,
            weightMultiplier: 40
          }
        },
        status: 'active',
        apiCredentials: {
          apiKey: 'fashionhub_api_key_789',
          secretKey: 'fashionhub_secret_abc'
        }
      }
    ];

    const sampleDrivers = [
      {
        driverId: 'DRV-001',
        personalInfo: {
          firstName: 'Kamal',
          lastName: 'Silva',
          email: 'kamal@swilogistics.lk',
          phone: '+94771234567',
          licenseNumber: 'B1234567'
        },
        vehicle: {
          vehicleId: 'VEH-001',
          type: 'van',
          capacity: {
            weight: 1000,
            volume: 8
          },
          licensePlate: 'CAB-1234'
        },
        status: 'available',
        currentLocation: {
          lat: 6.9271,
          lng: 79.8612,
          timestamp: new Date()
        },
        performance: {
          totalDeliveries: 150,
          successfulDeliveries: 142,
          avgDeliveryTime: 45,
          rating: 4.8
        }
      }
    ];

    await Client.insertMany(sampleClients);
    await Driver.insertMany(sampleDrivers);
    
    console.log('✅ Sample data created successfully');
    console.log('📋 Demo credentials:');
    console.log('   CLI-001: techshop_api_key_123');
    console.log('   CLI-002: fashionhub_api_key_789');
    
  } catch (error) {
    console.log('⚠️ Sample data creation skipped:', error.message);
  }
}

// Mock message processing for demo
class DemoMessageProcessor {
  static async processOrder(order) {
    console.log(`📦 Processing order ${order.orderId} in demo mode`);
    
    // Simulate processing delays
    setTimeout(() => {
      this.simulateWMSUpdate(order);
    }, 2000);
    
    setTimeout(() => {
      this.simulateROSUpdate(order);
    }, 3000);
  }
  
  static simulateWMSUpdate(order) {
    console.log(`📦 WMS: Package created for ${order.orderId}`);
    
    if (global.io) {
      global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
        orderId: order.orderId,
        status: 'picked_up',
        message: 'Package picked up from warehouse',
        timestamp: new Date()
      });
    }
  }
  
  static simulateROSUpdate(order) {
    console.log(`🚚 ROS: Route optimized for ${order.orderId}`);
    
    if (global.io) {
      global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
        orderId: order.orderId,
        status: 'in_transit',
        message: 'Package is in transit - route optimized',
        timestamp: new Date()
      });
      
      // Simulate driver assignment
      setTimeout(() => {
        global.io.to(`client-${order.clientId}`).emit('orderUpdate', {
          orderId: order.orderId,
          status: 'out_for_delivery',
          message: 'Package out for delivery - driver assigned',
          timestamp: new Date()
        });
      }, 5000);
    }
  }
}

// Make demo processor available globally
global.DemoMessageProcessor = DemoMessageProcessor;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong in demo mode!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SwiLogistics Middleware Server running on port ${PORT}`);
  console.log(`🌐 Client Portal: http://localhost:${PORT}`);
  console.log(`🔧 Mode: DEMO (MongoDB + Mock RabbitMQ)`);
  console.log(`📋 API Status: http://localhost:${PORT}/api/demo/status`);
});

module.exports = app;
