# SwiLogistics Middleware - Quick Start Guide

## Prerequisites Setup

### 1. Install MongoDB
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

### 2. Install RabbitMQ
```bash
# Windows (using Chocolatey)
choco install rabbitmq

# Or download from: https://www.rabbitmq.com/download.html
```

### 3. Start Services

#### Start MongoDB
```bash
# Windows
net start MongoDB

# Or manually
mongod --dbpath C:\data\db
```

#### Start RabbitMQ
```bash
# Windows
net start RabbitMQ

# Or manually
rabbitmq-server
```

## Project Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd swilogistics-middleware
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configurations
```

### 3. Database Setup
```bash
npm run setup
```

### 4. Start Development Server
```bash
npm run dev
```

## Using Docker (Alternative)

### Quick Start with Docker Compose
```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- RabbitMQ (port 5672, management UI: 15672)
- API Server (port 5000)

### RabbitMQ Management
- URL: http://localhost:15672
- Username: admin
- Password: admin123

## API Testing

### 1. Client Authentication
```bash
curl -X POST http://localhost:5000/api/auth/client/login \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLI-001",
    "apiKey": "techshop_api_key_123"
  }'
```

### 2. Submit Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "clientId": "CLI-001",
    "packageDetails": {
      "weight": 2.5,
      "dimensions": {
        "length": 30,
        "width": 20,
        "height": 15
      },
      "description": "Test Package",
      "value": 5000
    },
    "pickupAddress": {
      "street": "123 Main St",
      "city": "Colombo",
      "postalCode": "00100",
      "country": "Sri Lanka",
      "coordinates": {
        "lat": 6.9271,
        "lng": 79.8612
      }
    },
    "deliveryAddress": {
      "street": "456 Oak Ave",
      "city": "Kandy",
      "postalCode": "20000",
      "country": "Sri Lanka",
      "coordinates": {
        "lat": 7.2906,
        "lng": 80.6337
      },
      "contactName": "John Doe",
      "contactPhone": "+94771234567"
    },
    "priority": "normal"
  }'
```

### 3. Track Order
```bash
curl -X GET http://localhost:5000/api/orders/ORD-123/tracking \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Testing

### Connect to Real-time Updates
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Join client room for updates
socket.emit('join-room', 'client-CLI-001');

// Listen for order updates
socket.on('orderUpdate', (data) => {
  console.log('Order update:', data);
});
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: ECONNREFUSED 127.0.0.1:27017
   ```
   - Ensure MongoDB is running
   - Check MongoDB service status

2. **RabbitMQ Connection Error**
   ```
   Error: ECONNREFUSED 127.0.0.1:5672
   ```
   - Ensure RabbitMQ is running
   - Check RabbitMQ service status

3. **Port Already in Use**
   ```
   Error: EADDRINUSE :::5000
   ```
   - Change PORT in .env file
   - Kill process using port 5000

### Service Status Check
```bash
# Windows
sc query MongoDB
sc query RabbitMQ

# Check ports
netstat -an | findstr :5000
netstat -an | findstr :27017
netstat -an | findstr :5672
```

## Production Deployment

### Environment Variables
- Set NODE_ENV=production
- Use strong JWT_SECRET
- Configure proper database URLs
- Set up SSL certificates

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks
- API Health: http://localhost:5000/health
- MongoDB: Connection status in logs
- RabbitMQ: http://localhost:15672

## Development Tips

### Debugging
- Use VS Code debugger configuration
- Check logs in terminal output
- Monitor RabbitMQ queues in management UI

### Testing
```bash
npm test
```

### Code Style
```bash
npm run lint
npm run format
```
