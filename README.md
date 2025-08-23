# MenuEats: Group Project for CSCI318

A web app for food delivery service implementing Event Driven Architecture (EDA) with Domain Driven Design (DDD) and microservices.

## Tech Stack

- **Backend Framework**: Spring Boot (Java) - microservices with JPA
- **Frontend**: React.js - modern web application
- **AI Integration**: LangChain + LLM - intelligent chatbot service
- **Event Streaming**: Apache Kafka - asynchronous communication
- **Event Integration**: Spring Cloud Stream - event-driven messaging
- **API Gateway**: Spring Cloud Gateway - request routing and load balancing
- **Database**: H2 SQL (Local development)
- **Service Discovery**: Spring Cloud Discovery

## Project Structure

```
MenuEats/
├── README.md
├── .gitignore
│
├── frontend/
│   └── web-app/                        # React Frontend
│       ├── package.json
│       ├── src/
│       └── public/
│
├── backend/
│   ├── api-gateway/                    # Spring Cloud API Gateway
│   │   ├── pom.xml
│   │   └── src/main/java/
│   │
│   ├── services/
│   │   ├── restaurant-service/         # JPA Service
│   │   │   ├── pom.xml
│   │   │   ├── src/main/java/
│   │   │   └── src/main/resources/
│   │   │
│   │   ├── ordering-service/           # JPA Service  
│   │   │   ├── pom.xml
│   │   │   ├── src/main/java/
│   │   │   └── src/main/resources/
│   │   │
│   │   ├── discovery-service/          # JPA Service
│   │   │   ├── pom.xml
│   │   │   ├── src/main/java/
│   │   │   └── src/main/resources/
│   │   │
│   │   └── logistic-service/           # JPA Service
│   │       ├── pom.xml
│   │       ├── src/main/java/
│   │       └── src/main/resources/
│   │
│   └── chatbot-service/                # LLM + LangChain
│   |   ├── requirements.txt
│   |   └── app.py
│   │
│   └── databases/
│      ├── restaurant-db/              # H2 SQL Local
│      │   └── init.sql
│      └── ordering-db/                # H2 SQL Local  
│         └── init.sql
|
├── infrastructure/
│   └── kafka/                          # Local Kafka setup
│       └── config/                     # Kafka configuration files
│
├── shared/
│   ├── events/                         # Event schemas 
│   ├── common/                         # Shared utilities
│   └── configs/                        # Spring Cloud Stream configurations
│
└── docs/
    ├── architecture/                   # System design documentation
    │   ├── system-design.md
    │   ├── event-flow.md
    │   └── api-specs/
    │ 
    └── deployment/                    # Deployment guidelines ( Deciding )
```

## Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- Python 3.9+ (for chatbot service, uconfirmed)
- Apache Kafka (local installation)
- Maven 3.8+

## Configuration and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JiebaoIsMe/MenuEats.git
cd MenuEats
```

### 2. Backend Services Setup

#### Start Infrastructure Services
```bash
# Start Kafka (local installation)
# 1. Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# 2. Start Kafka Server
bin/kafka-server-start.sh config/server.properties
```

#### Configure Spring Boot Services
Each service uses H2 database and Spring Cloud Stream with the following configuration:
```yaml
# application.yml (common config)
spring:
  datasource:
    url: jdbc:h2:mem:menudb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
  h2:
    console:
      enabled: true
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092
      bindings:
        # Event channels configuration
        restaurantEvents-out-0:
          destination: restaurant-events
        orderEvents-out-0:
          destination: order-events
        logisticEvents-out-0:
          destination: logistic-events
```

#### Start Backend Services (in order)
```bash
# 1. Start Discovery Service
cd backend/services/discovery-service
mvn spring-boot:run

# 2. Start API Gateway
cd backend/api-gateway
mvn spring-boot:run

# 3. Start Business Services
cd backend/services/restaurant-service
mvn spring-boot:run

cd backend/services/ordering-service
mvn spring-boot:run

cd backend/services/logistic-service
mvn spring-boot:run

# 4. Start Chatbot Service
cd backend/chatbot-service
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend/web-app
npm install
npm start
```

## Service Endpoints

- **API Gateway**: http://localhost:8080
- **Discovery Service**: http://localhost:8761
- **Restaurant Service**: http://localhost:8081
- **Ordering Service**: http://localhost:8082
- **Logistic Service**: http://localhost:8083
- **Chatbot Service**: http://localhost:8084
- **React Frontend**: http://localhost:3000

## Sample Use Cases ( still need refine )

### 1. Restaurant Registration
```json
POST /api/restaurants
{
  "name": "Pizza Palace",
  "address": "123 Main St",
  "cuisine": "Italian",
  "phone": "+1-555-0123"
}
```

### 2. Menu Item Creation
```json
POST /api/restaurants/{restaurantId}/menu
{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 18.99,
  "category": "Pizza",
  "available": true
}
```

### 3. Place Order
```json
POST /api/orders
{
  "customerId": "customer123",
  "restaurantId": "rest456",
  "items": [
    {
      "menuItemId": "item789",
      "quantity": 2,
      "specialInstructions": "Extra cheese"
    }
  ],
  "deliveryAddress": "456 Oak Ave"
}
```

### 4. Chatbot Interaction
```json
POST /api/chatbot/ask
{
  "message": "What are the best pizza places nearby?",
  "userId": "user123",
  "context": {
    "location": "Downtown"
  }
}
```

### 5. Track Order Status
```json
GET /api/orders/{orderId}/status
```

## Architecture Highlights

- **Event-Driven**: Services communicate via Spring Cloud Stream and Kafka for loose coupling
- **Domain-Driven Design**: Each service represents a distinct business domain
- **Microservices**: Independent, scalable service deployment
- **API Gateway**: Centralized routing and cross-cutting concerns
- **Event Streaming**: Spring Cloud Stream abstracts messaging complexity
- **Reactive Frontend**: React.js for responsive user experience
- **AI Integration**: LangChain-powered chatbot for customer assistance

## Development Guidelines

- Follow REST API conventions
- Use proper HTTP status codes
- Implement proper error handling
- Write unit and integration tests
- Document API endpoints
- Use consistent naming conventions
- Follow Spring Boot best practices

## Configuration & Running Instructions

Provide clear, step-by-step instructions on how to configure and run the entire software  project, including Spring Boot applications, Apache Kafka, and any LLM API  configurations. 
sample inputs to demonstrate the use cases (outputs are not necessary) 
