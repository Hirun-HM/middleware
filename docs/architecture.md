# SwiLogistics Middleware Architecture Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Integration Patterns](#integration-patterns)
4. [Alternative Architectures](#alternative-architectures)
5. [Security Considerations](#security-considerations)
6. [Prototype Implementation](#prototype-implementation)

## Architecture Overview

### Conceptual Architecture
The SwiLogistics middleware architecture implements a **Service-Oriented Architecture (SOA)** with **Event-Driven Architecture (EDA)** patterns to integrate three heterogeneous systems:

```
┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐
│   Client    │    │                      │    │   Driver    │
│   Portal    │◄──►│   Node.js Middleware │◄──►│   Mobile    │
│ (React.js)  │    │      Orchestra       │    │    App      │
└─────────────┘    └──────────────────────┘    └─────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
              ┌─────────┐ ┌─────┐ ┌─────────┐
              │   CMS   │ │ ROS │ │   WMS   │
              │(SOAP/XML)│ │(REST)│ │ (TCP/IP)│
              └─────────┘ └─────┘ └─────────┘
```

### Implementation Architecture
```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                            │
├─────────────────┬──────────────────────────────────────────┤
│  Client Portal  │           Driver Mobile App               │
│   (React.js)    │            (React Native)                │
└─────────────────┴──────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Socket.IO     │
                    │  (WebSockets)   │
                    └────────┬────────┘
┌────────────────────────────┴────────────────────────────────┐
│                 API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────┤
│              Node.js + Express.js                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Auth Service│ │Order Service│ │Notification │          │
│  │             │ │             │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   RabbitMQ      │
                    │ Message Broker  │
                    └────────┬────────┘
┌────────────────────────────┴────────────────────────────────┐
│                INTEGRATION LAYER                            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │CMS Adapter  │ │ROS Adapter  │ │WMS Adapter  │            │
│ │(SOAP/XML)   │ │(REST/JSON)  │ │(TCP/IP)     │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │    MongoDB      │
                    │   Database      │
                    └─────────────────┘
```

## System Components

### 1. API Gateway (Node.js + Express.js)
- **Purpose**: Single entry point for all client requests
- **Responsibilities**:
  - Request routing and validation
  - Authentication and authorization
  - Protocol translation
  - Response aggregation
- **Technology**: Express.js with middleware stack

### 2. Message Broker (RabbitMQ)
- **Purpose**: Asynchronous message processing
- **Queues**:
  - `orders_to_wms`: Orders for warehouse processing
  - `orders_to_ros`: Orders for route optimization
  - `updates_to_clients`: Real-time updates
  - `driver_notifications`: Driver alerts
- **Pattern**: Publisher-Subscriber with message persistence

### 3. Database Layer (MongoDB)
- **Purpose**: Data persistence and state management
- **Collections**:
  - `orders`: Order lifecycle data
  - `clients`: Client management
  - `drivers`: Driver information and performance
- **Features**: Real-time queries, indexing, aggregation

### 4. Real-time Communication (Socket.IO)
- **Purpose**: Bidirectional real-time updates
- **Use Cases**:
  - Order status updates to clients
  - Route changes to drivers
  - Location tracking
  - Push notifications

### 5. Integration Adapters
#### CMS Adapter (SOAP/XML)
```javascript
// Protocol translation example
const soapEnvelope = {
  'soap:Envelope': {
    'soap:Body': {
      'cms:ValidateOrder': orderData
    }
  }
};
```

#### ROS Adapter (REST/JSON)
```javascript
// Route optimization request
const routeRequest = {
  deliveryPoints: [orderData.deliveryAddress],
  constraints: {
    maxDeliveries: 20,
    timeWindow: { start: '08:00', end: '18:00' }
  }
};
```

#### WMS Adapter (TCP/IP)
```javascript
// Binary message protocol
const message = {
  messageId: this.messageId++,
  messageType: 'CREATE_PACKAGE',
  data: packageData
};
```

## Integration Patterns

### 1. Message Queue Pattern
- **Purpose**: Decouple services and handle high volumes
- **Implementation**: RabbitMQ with persistent queues
- **Benefits**:
  - Fault tolerance
  - Load balancing
  - Guaranteed delivery

### 2. Adapter Pattern
- **Purpose**: Protocol and data format translation
- **Implementation**: Service-specific adapters
- **Benefits**:
  - System isolation
  - Reusability
  - Maintainability

### 3. Event-Driven Pattern
- **Purpose**: Real-time updates and notifications
- **Implementation**: Socket.IO + RabbitMQ
- **Benefits**:
  - Real-time responsiveness
  - Scalable broadcasting
  - Low latency

### 4. Circuit Breaker Pattern
- **Purpose**: Handle external service failures
- **Implementation**: Timeout and retry logic
- **Benefits**:
  - System resilience
  - Graceful degradation
  - Failure isolation

## Alternative Architectures

### Alternative 1: Enterprise Service Bus (ESB)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │             │    │   Driver    │
│   Portal    │◄──►│     ESB     │◄──►│    App      │
└─────────────┘    │(Apache Camel)│    └─────────────┘
                   │             │
                   │  ┌───────┐  │
                   │  │ Rules │  │
                   │  │Engine │  │
                   │  └───────┘  │
                   │             │
                   │  ┌───────┐  │
                   │  │Message│  │
                   │  │Router │  │
                   │  └───────┘  │
                   └─────────────┘
                         │
                ┌────────┼────────┐
                │        │        │
                ▼        ▼        ▼
          ┌─────────┐ ┌─────┐ ┌─────────┐
          │   CMS   │ │ ROS │ │   WMS   │
          └─────────┘ └─────┘ └─────────┘
```

**Pros**: Centralized routing, built-in transformation, enterprise features
**Cons**: Single point of failure, complexity, vendor lock-in

### Alternative 2: Microservices with API Gateway
```
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway                               │
│                (Kong/Zuul/Ambassador)                       │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
            ┌───────────┐ ┌──────────┐ ┌──────────────┐
            │  Order    │ │  Route   │ │ Notification │
            │ Service   │ │ Service  │ │   Service    │
            └───────────┘ └──────────┘ └──────────────┘
                    │        │        │
                    └────────┼────────┘
                             │
                    ┌────────┴────────┐
                    │  Event Bus      │
                    │   (Kafka)       │
                    └─────────────────┘
```

**Pros**: Service independence, technology diversity, scalability
**Cons**: Distributed complexity, network overhead, data consistency

### Selected Architecture Rationale
We chose the **Node.js Middleware Orchestra** approach because:

1. **Simplicity**: Easier to implement and understand
2. **Cost-effective**: Uses open-source technologies
3. **Rapid Development**: Faster prototype development
4. **Team Skills**: Leverages JavaScript/Node.js expertise
5. **Flexibility**: Easy to modify and extend
6. **Real-time Capabilities**: Native WebSocket support

## Security Considerations

### 1. Authentication & Authorization
```javascript
// JWT-based authentication
const token = jwt.sign(
  { clientId, type: 'client' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### 2. Input Validation
```javascript
// Joi schema validation
const orderSchema = Joi.object({
  clientId: Joi.string().required(),
  packageDetails: Joi.object().required(),
  // ... validation rules
});
```

### 3. Transport Security
- **HTTPS**: All client communications
- **TLS**: Database connections
- **VPN**: Internal service communication

### 4. Data Protection
- **Encryption**: Sensitive data at rest
- **Hashing**: Password storage
- **Sanitization**: Input cleaning

### 5. Rate Limiting
```javascript
// Express rate limiter
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Prototype Implementation

### Core Features Implemented
1. **Order Submission Flow**
   - Client submits order via REST API
   - Order stored in MongoDB
   - Messages sent to WMS and ROS queues
   - Real-time updates to client portal

2. **Mock System Integration**
   - CMS: SOAP/XML validation simulation
   - ROS: REST route optimization simulation
   - WMS: TCP/IP package tracking simulation

3. **Real-time Tracking**
   - WebSocket connections for live updates
   - Driver location broadcasting
   - Order status notifications

4. **Driver Mobile Support**
   - Manifest retrieval
   - Location updates
   - Delivery completion

### Minimal Implementation Scope
The prototype demonstrates:
- Core integration patterns
- Message flow orchestration
- Real-time communication
- Basic transaction management
- Security framework

### Future Enhancements
1. **Advanced Route Optimization**
2. **Machine Learning for Delivery Predictions**
3. **Mobile App with Offline Capabilities**
4. **Advanced Analytics Dashboard**
5. **Multi-tenant Architecture**
