# SwiLogistics Middleware Architecture

## Overview
This project implements a middleware architecture for SwiLogistics (Assignment 4) that integrates three critical systems:
- **CMS**: Client Management System (SOAP/XML API)
- **ROS**: Route Optimization System (REST/JSON API)  
- **WMS**: Warehouse Management System (Proprietary TCP/IP)

## Architecture Components

### Core Technologies
- **Node.js + Express.js**: API Gateway and Orchestration Layer
- **MongoDB**: Data Persistence
- **RabbitMQ**: Asynchronous Message Processing
- **Socket.IO**: Real-time Communication
- **Docker**: Containerization

### System Integration Patterns
1. **Message Queue Pattern**: RabbitMQ for async processing
2. **API Gateway Pattern**: Single entry point for all requests
3. **Event-Driven Architecture**: Real-time updates via WebSockets
4. **Protocol Translation**: SOAP ↔ REST ↔ TCP/IP conversion

## Project Structure
```
swilogistics-middleware/
├── src/
│   ├── server.js              # Main application entry point
│   ├── config/                # Configuration files
│   ├── controllers/           # Route handlers
│   ├── models/                # MongoDB schemas
│   ├── services/              # Business logic
│   ├── middleware/            # Custom middleware
│   ├── integrations/          # External system adapters
│   ├── workers/               # Background workers
│   └── utils/                 # Utility functions
├── client/                    # Client portal (React)
├── driver-app/               # Driver mobile app (React Native)
├── docker/                   # Docker configurations
├── docs/                     # Documentation
└── tests/                    # Test files
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- RabbitMQ
- Docker (optional)

### Installation
```bash
npm install
npm run setup
npm run dev
```

### Docker Setup
```bash
docker-compose up -d
```

## API Endpoints

### Order Management
- `POST /api/orders` - Submit new order
- `GET /api/orders/:id` - Get order status
- `PUT /api/orders/:id/status` - Update order status

### Client Portal
- `GET /api/clients/:id/orders` - Get client orders
- `GET /api/clients/:id/tracking` - Real-time tracking

### Driver App
- `GET /api/drivers/:id/manifest` - Get delivery manifest
- `PUT /api/deliveries/:id/complete` - Mark delivery complete

## Real-time Features
- Order status updates
- Route optimization notifications
- Delivery confirmations
- Driver location tracking

## Security
- JWT authentication
- HTTPS encryption
- Input validation
- Rate limiting
- CORS protection

## Testing
```bash
npm test
```

## Documentation
- [Architecture Design](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## Team Members
[Add team member names and contributions here]

## License
MIT
