# Activity 5: Microservice Simulation with REST API and RabbitMQ

<center>

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) &nbsp; [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) &nbsp; [![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/) &nbsp; [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

</center>

## 🎯 Objectives

- **Design and Implement** microservices architecture using REST APIs and RabbitMQ
- **Handle asynchronous communication** between services through message queuing
- **Demonstrate fault tolerance** and message persistence in distributed systems
- **Showcase containerization** and orchestration using Docker Compose

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Services](#-services)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Message Flow](#-message-flow)
- [Testing](#-testing)
- [Monitoring](#-monitoring)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

## 🚀 Project Overview

This project demonstrates a **microservices architecture** implementing an order processing system with three independent services communicating through **RabbitMQ message broker**. The system handles order placement, inventory management, and customer notifications asynchronously, ensuring scalability and fault tolerance.

### Key Features

- ✅ **Microservices Architecture** - Independent, loosely-coupled services
- ✅ **Asynchronous Communication** - Message-driven architecture using RabbitMQ
- ✅ **REST API** - HTTP endpoints for external interactions
- ✅ **Containerization** - Docker containers for consistent deployment
- ✅ **Fault Tolerance** - Retry mechanisms and error handling
- ✅ **Message Persistence** - Durable queues for reliable message delivery
- ✅ **Security** - Non-root containers and Alpine Linux base images

## 🏗️ Architecture

```
┌─────────────┐    HTTP POST    ┌─────────────────┐
│   Client    │ ──────────────► │  Order Service  │
│ (Postman)   │                 │   Port: 3001    │
└─────────────┘                 └─────────┬───────┘
                                          │
                                          ▼
                                ┌─────────────────┐
                                │    RabbitMQ     │
                                │   Port: 5672    │
                                │ Dashboard: 15672│
                                └─────────┬───────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                │ Notification    │ │   Inventory     │ │   Future        │
                │   Service       │ │    Service      │ │   Services      │
                │  Port: 3002     │ │   Port: 3003    │ │                 │
                └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🔧 Services

### 1. **Order Service** (Port: 3001)

- **Purpose**: Entry point for order processing
- **Technology**: Express.js REST API
- **Functionality**:
  - Accepts order requests via HTTP POST
  - Validates and queues orders to RabbitMQ
  - Implements retry logic for RabbitMQ connection
- **Endpoint**: `POST /order`

### 2. **Notification Service** (Port: 3002)

- **Purpose**: Handles customer notifications
- **Technology**: RabbitMQ Consumer
- **Functionality**:
  - Consumes order messages from queue
  - Sends order confirmations
  - Processes customer communications

### 3. **Inventory Service** (Port: 3003)

- **Purpose**: Manages product inventory
- **Technology**: RabbitMQ Consumer
- **Functionality**:
  - Updates inventory based on orders
  - Tracks product availability
  - Manages stock levels

### 4. **RabbitMQ** (Ports: 5672, 15672)

- **Purpose**: Message broker for service communication
- **Features**:
  - Durable message queues
  - Message persistence
  - Management dashboard
  - High availability

## 💻 Technologies

| Component            | Technology              | Version      |
| -------------------- | ----------------------- | ------------ |
| **Runtime**          | Node.js                 | 22-alpine    |
| **Framework**        | Express.js              | ^5.1.0       |
| **Message Broker**   | RabbitMQ                | 3-management |
| **Message Client**   | amqplib                 | ^0.10.8      |
| **Environment**      | dotenv                  | ^17.2.1      |
| **Containerization** | Docker & Docker Compose | Latest       |
| **Base OS**          | Alpine Linux            | Latest       |

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Node.js** 18+ (for local development)
- **Git** for version control
- **Postman** or similar API testing tool

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd Activity-5-Microservices
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# See .env.example for required variables
```

**Required Environment Variables:**

```bash
RABBITMQ_URL=amqp://username:password@rabbitmq:5672
ORDER_SERVICE_PORT=3001
NOTIFICATION_SERVICE_PORT=3002
INVENTORY_SERVICE_PORT=3003
AMQP_PORT=5672
RABBITMQ_DASHBOARD_PORT=15672
ORDER_QUEUE=orderQueue
```

> **⚠️ Security Note**: Never commit `.env` files to version control. Use `.env.example` for templates.

### 3. Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 4. Verify Installation

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs
```

## 📖 Usage

### Start the System

```bash
docker-compose up --build
```

### Send Order Request

```bash
curl -X POST http://localhost:3001/order \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "John Doe",
    "product": "Laptop",
    "quantity": 1,
    "price": 999.99
  }'
```

### Monitor Services

- **RabbitMQ Dashboard**: <http://localhost:15672> (default credentials)
- **Service Logs**: Check Docker Desktop or use `docker-compose logs`

## 📚 API Documentation

### POST /order

**Endpoint**: `http://localhost:3001/order`

**Request Headers**:

```http
Content-Type: application/json
```

**Request Body**:

```json
{
	"customer": "string",
	"product": "string",
	"quantity": "number (optional)",
	"price": "number (optional)"
}
```

**Success Response** (201):

```json
{
	"message": "Order received and queued successfully!"
}
```

**Error Response** (500):

```json
{
	"error": "Failed to connect to RabbitMQ"
}
```

## 🔄 Message Flow

1. **Client** sends POST request to Order Service
2. **Order Service** receives and validates the order
3. **Order Service** connects to RabbitMQ with retry logic
4. **Order Service** publishes message to `orderQueue`
5. **Notification Service** consumes message and processes notification
6. **Inventory Service** consumes message and updates inventory
7. **Services** acknowledge message processing

## 🧪 Testing

### Manual Testing with Postman

1. **Import Collection**: Use the provided Postman collection
2. **Send Request**:
   - Method: POST
   - URL: `http://localhost:3001/order`
   - Body: JSON with customer and product details
3. **Verify Response**: Should receive 201 status with success message
4. **Check Logs**: Monitor service logs for message processing

### Sample Test Cases

```json
// Test Case 1: Complete Order
{
  "customer": "Alice Johnson",
  "product": "Gaming Laptop",
  "quantity": 1,
  "price": 1299.99
}

// Test Case 2: Minimal Order
{
  "customer": "Bob Smith",
  "product": "Wireless Mouse"
}

// Test Case 3: Bulk Order
{
  "customer": "Corporate Client",
  "product": "Office Chairs",
  "quantity": 50,
  "price": 150.00
}
```

## 📊 Monitoring

### Docker Desktop

- Navigate to **Containers** tab
- Click on individual containers to view logs
- Monitor resource usage and health status

### RabbitMQ Management

- Access: <http://localhost:15672>
- Default Username: `guest` | Default Password: `guest`
- Monitor queues, exchanges, and message flow

> **⚠️ Production Warning**: Change default RabbitMQ credentials in production environments.

### Command Line

```bash
# View all service logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f order-service
docker-compose logs -f notification-service
docker-compose logs -f inventory-service

# Check container status
docker-compose ps
```

## 📁 Project Structure

```
Activity-5-Microservices/
├── 📄 README.md
├── 📄 docker-compose.yml
├── 📄 .env
├── 📄 .env.example
├── 📄 .gitignore
│
├── 📁 order-service/
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 index.js
│   └── 📄 .dockerignore
│
├── 📁 notification-service/
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 index.js
│   └── 📄 .dockerignore
│
└── 📁 inventory-service/
    ├── 📄 Dockerfile
    ├── 📄 package.json
    ├── 📄 index.js
    └── 📄 .dockerignore
```

### Service Dependencies

```json
{
	"amqplib": "^0.10.8",
	"dotenv": "^17.2.1",
	"express": "^5.1.0"
}
```

## 🛡️ Security Features

- **Non-root containers**: Services run under dedicated `app` user
- **Alpine Linux**: Minimal attack surface with security-focused OS
- **Environment isolation**: Sensitive data in environment variables
- **Network isolation**: Services communicate through Docker network
- **Input validation**: Request body validation and sanitization

## 🔧 Troubleshooting

### Common Issues

**Port Conflicts**:

```bash
# Check port usage
netstat -ano | findstr :5672
netstat -ano | findstr :3001

# Stop conflicting services
docker stop <container-name>
```

**Connection Refused**:

```bash
# Restart services
docker-compose down
docker-compose up --build
```

**RabbitMQ Connection Failed**:

- Verify RabbitMQ container is running
- Check environment variables
- Ensure network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**ITE4 Student - [JianefrelDionaldo](https://github.com/JianefrelDionaldo)**
_Microservices Architecture Implementation_

## 🔒 Security Best Practices

- **.env files**: Never commit environment files to version control
- **Default credentials**: Change RabbitMQ default credentials in production
- **Container security**: Services run as non-root users
- **Network isolation**: Services communicate through internal Docker networks
- **Input validation**: Always validate and sanitize user inputs
- **Secrets management**: Use Docker secrets or external secret management in production

---

### 🌟 **Star this repository if you found it helpful!**
