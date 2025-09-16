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
│   └── menueats-app/                   # React Frontend (Vite)
│       ├── package.json
│       ├── vite.config.js
│       ├── src/
│       │   ├── App.jsx               # Root component of application
│       │   ├── components/           # Reusable UI components
│       │   │   ├──  layout/          # Self customized layout 
│       │   │   └──  ui/              # components from shadcn ui     
│       │   ├── pages/                # Page components (Home, Login ,Register, etc.)
│       │   ├── services/             # API calls, external services
│       │   ├── hooks/                # Custom React hooks
│       │   └── utils/                # Helper functions, constants
│       └── public/                   # logo
│
├── backend/
│   ├── pom.xml                        # Root Parent Maven POM
│   ├── mvnw                           # Unix/Linux Maven Wrapper
│   ├── mvnw.cmd                       # Window Maven Wrapper
│   │
│   ├── api-gateway/                   # Spring Cloud API Gateway
│   │   ├── pom.xml
│   │   └── src/main/resources/
│   │       └── application.properties # API Gateway config
│   │
│   ├── config-service/                # Spring Cloud Config
│   │   └── pom.xml
│   │
│   ├── services/
│   │   ├── discovery-service/         # Service Registry
│   │   │   ├── pom.xml
│   │   │   └── src/main/resources/
│   │   │       └── application.properties # Discovery service config
│   │   │
│   │   ├── restaurant-service/        # JPA Service
│   │   │   ├── pom.xml
│   │   │   ├── data/
│   │   │   │   └── restaurantdb.mv.db # H2 database file (file-based)
│   │   │   └── src/main/resources/
│   │   │       ├── application.properties # Restaurant H2 database config
│   │   │       ├── data.sql           # Initial data script (optional)
│   │   │       └── schema.sql         # Database schema script (optional)
│   │   │
│   │   ├── ordering-service/          # JPA Service  
│   │   │   ├── pom.xml
│   │   │   ├── data/
│   │   │   │   └── orderingdb.mv.db   # H2 database file (file-based)
│   │   │   └── src/main/resources/
│   │   │       ├── application.properties # Ordering H2 database config
│   │   │       ├── data.sql           # Initial data script (optional)
│   │   │       └── schema.sql         # Database schema script (optional)
│   │   │
│   │   ├── logistics-service/         # JPA Service
│   │   │   ├── pom.xml
│   │   │   ├── data/
│   │   │   │   └── logisticsdb.mv.db  # H2 database file (file-based)
│   │   │   └── src/main/resources/
│   │   │       ├── application.properties # Logistics H2 database config
│   │   │       ├── data.sql           # Initial data script (optional)
│   │   │       └── schema.sql         # Database schema script (optional)
│   │   │
│   │   └── user-service/              # JPA Service  
│   │       ├── pom.xml
│   │       └── src/main/resources/
│   │           ├── application.properties # User H2 database config
│   │           ├── data.sql           # Initial user data script (uses MERGE statements)
│   │           └── userdb.mv.db       # H2 database file (file-based)
│   │
│   ├── chatbot-llm/                   # LangChain + LLM Service
│   │   ├── requirements.txt
│   │   └── app.py
│   │
│   └── shared/                        # Shared Maven modules
│       ├── common/                    # Common utilities
│       ├── events/                    # Event schemas 
│       ├── configs/                   # Spring Cloud Stream configurations
│       └── database/                  # Shared database files 
│           ├── shared-menudb.mv.db    # Shared H2 database file
│           ├── init-data.sql          # Shared initial data
│           └── shared-schema.sql      # Shared database schema
│
├── docs/
│   ├── architecture/                  # System design documentation
│   │   ├── system-design.md
│   │   ├── event-flow.md
│   │   └── api-specs/
│   │ 
│   └── deployment/                    # Deployment guidelines
│
└── infrastructure/
    └── kafka/                         # Local Kafka setup
        └── config/                    # Kafka configuration files
```

## Prerequisites

- Java 21 or higher
- Node.js 18+ and npm
- Python 3.9+ (for chatbot service)
- Apache Kafka 3.7.2 (local installation)
- Maven 3.8+

## Configuration and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JiebaoIsMe/MenuEats.git
cd MenuEats
```

### 2. Backend Services Setup

#### Services Initialization and Installation

```bash
# Navigate to backend directory
cd backend

# Validate the parent pom.xml syntax
./mvnw validate

# Check if all module pom.xml files are valid
./mvnw help:effective-pom

# Clean and install all services
./mvnw clean install

# Or to compile only
./mvnw clean compile

# Compile certain service only
./mvnw compile -pl services/discovery-service

# To run a specific service (after install)
./mvnw spring-boot:run -pl services/discovery-service
./mvnw spring-boot:run -pl services/restaurant-service
./mvnw spring-boot:run -pl services/logistics-service
./mvnw spring-boot:run -pl services/user-service
./mvnw spring-boot:run -pl api-gateway
```

#### Start Infrastructure Services
```bash
# Start Kafka (local installation)
# 1. Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# 2. Start Kafka Server
bin/kafka-server-start.sh config/server.properties
```

#### Configure Spring Boot Services

Each service uses H2 database and Spring Cloud Stream. Configure each service's `application.properties`:

**Discovery Service** (`backend/services/discovery-service/src/main/resources/application.properties`):
```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

**Restaurant Service** (`backend/services/restaurant-service/src/main/resources/application.properties`):
```properties
server.port=8081
spring.datasource.url=jdbc:h2:mem:restaurantdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.cloud.stream.kafka.binder.brokers=localhost:9092
spring.cloud.stream.bindings.restaurantEvents-out-0.destination=restaurant-events
```

**Ordering Service** (`backend/services/ordering-service/src/main/resources/application.properties`):
```properties
server.port=8082
spring.datasource.url=jdbc:h2:mem:orderingdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.cloud.stream.kafka.binder.brokers=localhost:9092
spring.cloud.stream.bindings.orderEvents-out-0.destination=order-events
```

**Logistics Service** (`backend/services/logistics-service/src/main/resources/application.properties`):
```properties
server.port=8083
spring.datasource.url=jdbc:h2:mem:logisticsdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.cloud.stream.kafka.binder.brokers=localhost:9092
spring.cloud.stream.bindings.logisticEvents-out-0.destination=logistic-events
```

**User Service** (`backend/services/user-service/src/main/resources/application.properties`):
```properties
spring.application.name=user-service
server.port=8084

# H2 Database Configuration
spring.datasource.url=jdbc:h2:file:./src/main/resources/userdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Data Initialization
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=never
```

**API Gateway** (`backend/api-gateway/src/main/resources/application.properties`):
```properties
server.port=8080
spring.cloud.gateway.discovery.locator.enabled=true
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

#### Start Backend Services
```bash
# Build all services from parent directory
cd backend
./mvnw clean install

# Start services (in order) - use separate terminals
./mvnw spring-boot:run -pl services/discovery-service
./mvnw spring-boot:run -pl api-gateway  
./mvnw spring-boot:run -pl services/restaurant-service
./mvnw spring-boot:run -pl services/ordering-service
./mvnw spring-boot:run -pl services/logistics-service
./mvnw spring-boot:run -pl services/user-service

# Start LangChain Chatbot Service
cd chatbot-llm
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend/menueats-app
npm install
npm run dev
```

## Endpoints

### Services
- **API Gateway**: http://localhost:8080
- **Discovery Service**: http://localhost:8761
- **Restaurant Service**: http://localhost:8081
- **Ordering Service**: http://localhost:8082
- **Logistic Service**: http://localhost:8083
- **User Service**: http://localhost:8084
- **LangChain Chatbot Service**: http://localhost:8085
- **React Frontend**: http://localhost:3000

### Apache
- **Kafka Broker**: http://localhost:9092
- **Kafka Zookeeper**: http://localhost:2181


## Sample Use Cases ( sketch )

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

### 6. User Authentication & Profile Management
```json
POST /api/users/login
{
  "username": "admin",
  "password": "password"
}

GET /api/users/{userId}/profile

POST /api/users/register
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password",
  "role": "CUSTOMER"
}
```

## User Service Details

The User Service manages user authentication, profiles, and role-based access control with the following features:

- **File-based H2 Database**: Persistent storage at `./src/main/resources/userdb.mv.db`
- **Initial Data**: Pre-loaded with 5 sample users including admin, customers, and restaurant owners
- **Role Management**: Supports ADMIN, CUSTOMER, DRIVER, and RESTAURANT_OWNER roles
- **MERGE Statements**: Uses MERGE instead of INSERT to prevent duplicate key errors on restart
- **H2 Console**: Available at `http://localhost:8084/h2-console` for database inspection

**Default Users Available:**
- `admin` - System Administrator
- `customer1`, `customer2` - Sample customers  
- `pizzaowner`, `burgerowner` - Restaurant owners

**Database Access:**
- URL: `jdbc:h2:file:./src/main/resources/userdb`
- Username: `sa`
- Password: `password`

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
