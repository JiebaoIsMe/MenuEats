# MenuEats: Group Project for CSCI318

A web app for food delivery service implementing Event Driven Architecture (EDA) with Domain Driven Design (DDD) and microservices.

## Tech Stack

- **Backend Framework**: Spring Boot (Java) - microservices with JPA
- **Frontend**: React.js - modern web application
- **AI Integration**: LangChain + LLM - intelligent chatbot service with RAG
- **Vector Database**: Elasticsearch - vector embeddings storage and similarity search
- **Event Streaming**: Apache Kafka - asynchronous communication
- **Event Integration**: Spring Cloud Stream - event-driven messaging
- **API Gateway**: Spring Cloud Gateway - request routing and load balancing
- **Database**: H2 SQL (Local development)
- **Service Discovery**: Spring Cloud Discovery


## Prerequisites
- Java 21 or higher
- Node.js 18+ and npm
- Apache Kafka 3.7.2 (local installation)
- Maven 3.8+
- Kafka 2.13-3.7.2 ( available at https://archive.apache.org/dist/kafka/3.7.2/kafka_2.13-3.7.2.tgz )

## User Manual

### Terminal Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/JiebaoIsMe/MenuEats.git
cd MenuEats
```

### 2. Backend Services Initialization and Installation
```bash
# Navigate to backend directory
cd backend

# Clean and install all services
./mvnw clean install

# Or to compile only
./mvnw clean compile

# (Optionally) Compile specific service only
./mvnw compile -pl services/discovery-service
```

#### Start Infrastructure Services ( Kafka for event streaming)
```bash
# Start Kafka (local installation required)
# Navigate to your Kafka installation directory

# 1. Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# 2. Start Kafka Server
bin/kafka-server-start.sh config/server.properties

#3. Start messaging event 's consumer listener 
 ./bin/kafka-console-consumer.sh --bootstrap-server=localhost:9092 --topic messaging-events
```

#### Start Backend Services (Required Order)
```bash
# Start services in the correct order (use separate terminals)

# 1. Discovery Service (must start first)
./mvnw spring-boot:run -pl services/discovery-service

# 2. All other services (can start in parallel)
./mvnw spring-boot:run -pl services/restaurant-service
./mvnw spring-boot:run -pl services/ordering-service
./mvnw spring-boot:run -pl services/logistics-service
./mvnw spring-boot:run -pl services/user-service
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/menueats-app/menueats-app

# Install dependencies
npm install

# Start development servers on different ports for role-based access
PORT=3000 npm run dev  # Customer interface
PORT=3001 npm run dev  # Business Owner interface (run in separate terminal)
PORT=3002 npm run dev  # Rider interface (run in separate terminal)
```

### 4. Testing the Application & Use Cases

**Note:** All functionality can be tested using the UI buttons in the web application. Check outputs in browser console or directly in the UI interface.

**⚠️ Simulation Notes:**
- **No Real Payment System**: Payment processing is simulated - orders proceed without actual payment
- **Automatic Status Progression**: After restaurant accepts order, status automatically changes every few seconds to simulate real-life events: PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY

#### **Use Case 1: Customer Order Flow (Simulated Payment)**
1. Login as customer: `john` / `password123`
2. Browse restaurants on Customer interface (http://localhost:3000)
3. Select restaurant and add items to cart
4. Proceed to checkout with delivery address
5. Click "Confirm Order" (payment is simulated - no real transaction)
6. Order status starts as "PENDING"

#### **Use Case 2: Restaurant Owner Order Management**
1. Login as business owner: `mario` / `password123`
2. Access Business Owner interface (http://localhost:3001)
3. Navigate to "Order History" to view incoming orders
4. **Accept Order**: Click "Accept" button → Order status changes to "CONFIRMED"
5. **Automatic Simulation**: After acceptance, order status automatically progresses:
   - CONFIRMED → PREPARING (after ~30 seconds)
   - PREPARING → READY_FOR_PICKUP (after ~60 seconds)
6. **Reject Order**: Click "Reject" button → Order status changes to "CANCELLED"
7. Send status updates to customer via messaging

#### **Use Case 3: Rider Order Management**
1. Login as rider: `mike` / `password123`
2. Access Rider interface (http://localhost:3002)
3. View available orders with "READY_FOR_PICKUP" status
4. **Accept Delivery**: Click "Accept Delivery" button
5. **Pick Up Order**: Click "Picked Up" → Order status changes to "OUT_FOR_DELIVERY"
6. **Complete Delivery**: Click "Delivered" → Order status changes to "DELIVERED"
7. **Reject Delivery**: Click "Reject" if unable to deliver
8. **Automatic Progression**: Status changes simulate real delivery timelines

#### **Use Case 4: Real-time Event Simulation & Messaging**
1. Customer places order → Restaurant receives notification
2. Restaurant accepts → Automatic status progression begins (simulated kitchen workflow)
3. Status updates trigger real-time notifications to all parties
4. Rider receives pickup notification when status reaches "READY_FOR_PICKUP"
5. All parties can communicate via messaging interface during the process

#### **Use Case 5: AI Chatbot Restaurant Recommendations**
1. Access Customer interface chatbot
2. Ask: "What Italian restaurants do you recommend?"
3. Ask: "Show me vegetarian options at Mario's Restaurant"
4. Ask: "What are the most popular dishes?"

#### **Authentication Sample Inputs:**
- **Customer**: `john` / `password123` or `jane` / `password123`
- **Business Owner**: `mario` / `password123` or `bob` / `password123`  
- **Rider**: `mike` / `password123` or `sarah` / `password123`

## Configurations
Each service uses H2 database. Services communicate via user-service using HTTP request and response:

### Discovery Service Configuration
**File**: `backend/services/discovery-service/src/main/resources/application.properties`
```properties
spring.application.name=discovery-service
server.port=8761
spring.h2.console.enabled=true
spring.datasource.url=jdbc:h2:mem:disoverydb

# Enable Azure AI Search profile for vector embeddings
spring.profiles.active=azure-ai-search
```

**LLM & RAG Configuration** (`backend/services/discovery-service/src/main/java/com/discovery/config/ChatbotConfig.java`):
```java
@Configuration
public class ChatbotConfig {
    
    // Define API KEYs
    static{
        System.setProperty("OLLAMA_API_KEY", "{in file}");
        
        // Set Azure OpenAI properties
        System.setProperty("AZURE_OPENAI_ENDPOINT", "https://menueats.openai.azure.com/");
        System.setProperty("AZURE_OPENAI_KEY", "{in file}");
        
        // Set Azure AI Search properties
        System.setProperty("AZURE_AI_SEARCH_ENDPOINT", "https://menueats.search.windows.net/");
        System.setProperty("AZURE_AI_SEARCH_KEY", "{in file}");
    }

    @Bean
    ChatModel OllamaChatModel() {
        return OllamaChatModel.builder()
            .baseUrl("https://ollama.com")
            .modelName("gpt-oss:120b")
            .customHeaders(Map.of("Authorization", "Bearer {in file}"))
            .logRequests(true)
            .logResponses(true)
            .build();
    }
    
    @Bean
    @Profile("azure-ai-search")
    EmbeddingModel azureOpenAiEmbeddingModel() {
        return AzureOpenAiEmbeddingModel.builder()
                .apiKey(azureOpenAiKey)
                .endpoint(azureOpenAiEndpoint)
                .deploymentName("text-embedding-3-small")
                .logRequestsAndResponses(true)
                .build();
    }
}
```

**RAG Vector Store Configuration** (`backend/services/discovery-service/src/main/java/com/discovery/config/AzureAiSearchConfig.java`):
```java
@Configuration
@Profile("azure-ai-search")
public class AzureAiSearchConfig {

    @Bean
    EmbeddingStore<TextSegment> embeddingStore() {
        return AzureAiSearchEmbeddingStore.builder()
                .endpoint(azureAiSearchEndpoint)
                .apiKey(azureAiSearchKey)
                .indexName("menueats-restaurants")
                .dimensions(1536) // Azure OpenAI text-embedding-3-small uses 1536 dimensions
                .build();
    }
}
```

### Restaurant Service Configuration
**File**: `backend/services/restaurant-service/src/main/resources/application.properties`
```properties
spring.application.name=restaurant-service
server.port=8081

# H2 Database Configuration
spring.datasource.url=jdbc:h2:file:./src/main/resources/restaurantdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.jpa.show-sql=true
```

### Ordering Service Configuration
**File**: `backend/services/ordering-service/src/main/resources/application.properties`
```properties
spring.application.name=ordering-service
server.port=8082

# H2 Database Configuration
spring.datasource.url=jdbc:h2:file:./src/main/resources/orderingdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.jpa.show-sql=true
```

### Logistics Service Configuration
**File**: `backend/services/logistics-service/src/main/resources/application.properties`
```properties
spring.application.name=logistic-service
server.port=8083

# H2 Database Configuration
spring.datasource.url=jdbc:h2:file:./src/main/resources/logisticsdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.jpa.show-sql=true
```

### User Service Configuration
**File**: `backend/services/user-service/src/main/resources/application.properties`
```properties
spring.application.name=user-service
server.port=8084

# H2 Database Configuration
spring.datasource.url=jdbc:h2:file:./services/user-service/src/main/resources/userdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.jpa.show-sql=true

# Kafka Configuration for event streaming
spring.cloud.stream.kafka.binder.brokers=localhost:9092
spring.cloud.stream.bindings.userEvents-out-0.destination=user-events
spring.cloud.stream.bindings.messagingEvents-out-0.destination=messaging-events
```

## Application Access

### Backend Services
- **Discovery Service (AI Chatbot)**: http://localhost:8761
- **Restaurant Service**: http://localhost:8081  
- **Ordering Service**: http://localhost:8082
- **Logistics Service**: http://localhost:8083
- **User Service**: http://localhost:8084

### Frontend Applications
- **Customer Portal**: http://localhost:3000
- **Business Owner Portal**: http://localhost:3001
- **Rider Portal**: http://localhost:3002

### Database Consoles (H2)
- **User Service Database**: http://localhost:8084/h2-console
- **Restaurant Service Database**: http://localhost:8081/h2-console  
- **Ordering Service Database**: http://localhost:8082/h2-console
- **Logistics Service Database**: http://localhost:8083/h2-console

### Infrastructure
- **Kafka Broker**: localhost:9092
- **Kafka Zookeeper**: localhost:2181

**Default Users Available:**
- `mike` (password: password123) - Rider/Driver
- `john` (password: password123) - Customer user
- `jane` (password: password123) - Customer user
- `mario` (password: password123) - Restaurant Business Owner  
- `bob` (password: password123) - Restaurant Business Owner
- `sarah` (password: password123) - Rider/Driver

## Project Structure

```
MenuEats/
├── README.md
├── .gitignore
│
├── frontend/
│   └── menueats-app/                   # React Frontend (Vite)
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       ├── src/
│       │   ├── App.jsx               # Root component with role-based routing
│       │   ├── components/
│       │   │   └── ui/               # shadcn UI components
│       │   │       ├── sidebar.jsx
│       │   │       ├── app-sidebar.jsx
│       │   │       ├── ai-chatroom.jsx
│       │   │       ├── checkbox.jsx
│       │   │       ├── order-checkout.jsx
│       │   │       ├── radio-group.jsx
│       │   │       ├── restaurant-menu.jsx
│       │   │       ├── select.jsx
│       │   │       ├── textarea.jsx
│       │   │       ├── toast.jsx
│       │   │       └── use-toast.js
│       │   ├── pages/                # Role-based page components
│       │   │   ├── login.jsx
│       │   │   ├── messaging.jsx
│       │   │   ├── CustomerHome.jsx
│       │   │   ├── CustomerMessaging.jsx
│       │   │   ├── CustomerOrderHistory.jsx
│       │   │   ├── BusinessOwnerHome.jsx
│       │   │   ├── BusinessOwnerMessaging.jsx
│       │   │   ├── BusinessOwnerOrderHistory.jsx
│       │   │   ├── RiderHome.jsx
│       │   │   ├── RiderMessaging.jsx
│       │   │   ├── RiderOrderHistory.jsx
│       │   │   ├── ManageMenu.jsx
│       │   │   ├── EditRestaurantInfo.jsx
│       │   │   ├── OrderSummary.jsx
│       │   │   └── Profile.jsx
│       │   ├── services/             # API service layer
│       │   ├── hooks/                # Custom React hooks
│       │   │   ├── useAuth.js
│       │   │   ├── useChat.js
│       │   │   ├── useChatbot.js
│       │   │   └── useMessaging.js
│       │   └── utils/
│       └── public/
│
├── backend/
│   ├── pom.xml                        # Root Parent Maven POM
│   ├── mvnw                           # Unix/Linux Maven Wrapper
│   ├── mvnw.cmd                       # Windows Maven Wrapper
│   │
│   ├── js-tests/                      # Backend API testing
│   │   ├── basics/
│   │   └── interconnections/
│   │
│   └── services/
│       ├── discovery-service/         # Eureka Service Registry + AI Chatbot
│       │   ├── pom.xml
│       │   └── src/main/java/com/discovery/
│       │       ├── DiscoveryServiceApplication.java
│       │       ├── config/
│       │       │   └── ChatModelConfig.java
│       │       ├── service/
│       │       │   ├── ChatbotService.java
│       │       │   └── EmbeddingService.java
│       │       ├── repository/
│       │       │   └── ChatbotRepository.java
│       │       └── controller/
│       │           └── ChatbotController.java
│       │
│       ├── restaurant-service/        # Restaurant & Menu Management
│       │   ├── pom.xml
│       │   └── src/main/java/com/restaurant/
│       │       ├── RestaurantServiceApplication.java
│       │       ├── controller/
│       │       │   ├── RestaurantControllers.java
│       │       │   └── MenuControllers.java
│       │       ├── service/
│       │       │   ├── RestaurantService.java
│       │       │   └── MenuService.java
│       │       ├── repository/
│       │       │   └── MenuRepository.java
│       │       └── resources/
│       │           ├── application.properties
│       │           ├── data.sql
│       │           └── restaurantdb.mv.db
│       │
│       ├── ordering-service/          # Order Management & Processing
│       │   ├── pom.xml
│       │   ├── services/
│       │   └── src/main/java/com/ordering/
│       │       ├── OrderingServiceApplication.java
│       │       ├── controller/
│       │       │   └── OrderController.java
│       │       ├── service/
│       │       │   └── OrderService.java
│       │       ├── repository/
│       │       │   └── OrderRepository.java
│       │       ├── model/
│       │       │   ├── Order.java
│       │       │   ├── OrderItem.java
│       │       │   └── OrderStatus.java
│       │       ├── dto/
│       │       │   └── OrderItemResponse.java
│       │       └── resources/
│       │           ├── application.properties
│       │           ├── data.sql
│       │           └── orderingdb.mv.db
│       │
│       ├── logistics-service/         # Delivery & Rider Management
│       │   ├── pom.xml
│       │   └── src/main/java/com/logistic/
│       │       ├── LogisticServiceApplication.java
│       │       ├── controller/
│       │       │   └── LogisticsController.java
│       │       ├── service/
│       │       │   └── LogisticsService.java
│       │       ├── repository/
│       │       │   └── LogisticsRepository.java
│       │       ├── model/
│       │       │   └── Logistics.java
│       │       ├── dto/
│       │       │   └── LogisticsResponse.java
│       │       ├── config/
│       │       │   └── KafkaConfig.java
│       │       └── resources/
│       │           ├── application.properties
│       │           ├── data.sql
│       │           └── logisticsdb.mv.db
│       │
│       └── user-service/              # User Management + Messaging + Service Proxy + CQRS + EDA
│           ├── pom.xml
│           ├── services/
│           └── src/main/java/com/user/
│               ├── UserServiceApplication.java
│               ├── application/                # CQRS Application Layer
│               │   ├── commands/              # Command Objects
│               │   │   └── SendMessageCommand.java
│               │   └── handlers/              # Command Handlers
│               │       └── MessageCommandHandler.java
│               ├── domain/                    # Domain Layer with DDD + Event Sourcing
│               │   ├── user/
│               │   │   ├── model/
│               │   │   │   ├── User.java
│               │   │   │   ├── UserProfile.java
│               │   │   │   ├── UserRepository.java
│               │   │   │   └── UserProfileRepository.java
│               │   │   ├── service/
│               │   │   │   └── UserDomainService.java
│               │   │   └── events/            # User Domain Events
│               │   │       ├── UserRegisteredEvent.java
│               │   │       └── UserUpdatedEvent.java
│               │   ├── messaging/             # Messaging Bounded Context
│               │   │   ├── model/
│               │   │   │   ├── Message.java
│               │   │   │   └── MessageRepository.java
│               │   │   ├── service/
│               │   │   │   └── MessagingDomainService.java
│               │   │   └── events/            # Messaging Domain Events
│               │   │       ├── MessageSentEvent.java
│               │   │       └── ConversationStartedEvent.java
│               │   ├── status/                # Status Bounded Context
│               │   │   ├── model/
│               │   │   │   ├── UserStatus.java
│               │   │   │   └── UserStatusRepository.java
│               │   │   └── events/            # Status Domain Events
│               │   │       ├── StatusChangedEvent.java
│               │   │       └── TypingEvent.java
│               │   └── auth/                  # Authentication Bounded Context
│               │       └── service/
│               │           └── AuthenticationService.java
│               ├── infrastructure/            # Infrastructure Layer
│               │   ├── web/                   # REST Controllers
│               │   │   ├── UserController.java
│               │   │   ├── MessageController.java    # CQRS Controller
│               │   │   ├── AuthController.java
│               │   │   ├── OrderController.java      # Proxy Controller
│               │   │   └── LogisticsController.java  # Proxy Controller
│               │   ├── integration/           # Service Integration Layer
│               │   │   ├── RestaurantIntegrationService.java
│               │   │   ├── OrderIntegrationService.java
│               │   │   └── LogisticsIntegrationService.java
│               │   ├── messaging/             # Event Processing Infrastructure
│               │   │   └── EventProcessorConfiguration.java
│               │   └── config/                # Configuration
│               │       ├── WebConfig.java
│               │       ├── KafkaConfig.java         # Kafka EDA Configuration
│               │       └── RestTemplateConfig.java
│               ├── dto/                       # Data Transfer Objects
│               │   ├── MessageResponse.java
│               │   ├── UserResponse.java
│               │   ├── CreateUserRequest.java
│               │   ├── SendMessageRequest.java
│               │   ├── LoginRequest.java
│               │   ├── AuthResponse.java
│               │   ├── UserStatusResponse.java
│               │   ├── RestaurantResponse.java
│               │   ├── OrderDTO.java
│               │   └── OrderItemDTO.java
│               ├── shared/                    # Shared Kernel
│               │   ├── valueobjects/          # Value Objects
│               │   │   ├── UserId.java
│               │   │   ├── MessageId.java
│               │   │   └── ConversationId.java
│               │   └── events/                # Event Infrastructure
│               │       ├── DomainEvent.java
│               │       └── DomainEventPublisher.java
│               └── resources/
│                   ├── application.properties
│                   ├── data.sql
│                   └── userdb.mv.db
```

## Architecture & System Design's Summary 

### User Service Features
The User Service manages user authentication, profiles, and role-based access control with the following features:
- **File-based H2 Database**: Persistent storage at `./src/main/resources/userdb.mv.db`
- **Initial Data**: Pre-loaded with 6 sample users including customers, business owners, and riders
- **Role Management**: Supports CUSTOMER, RIDER, and BUSINESS_OWNER roles
- **Service Proxy**: Acts as a proxy to connect other microservices through HTTP requests
- **Event-Driven Architecture**: **Only user-service implements EDA** with Kafka messaging events and data streaming for real-time messaging functionality
- **H2 Console**: Available at `http://localhost:8084/h2-console` for database inspection

### Architecture Highlights
- **Microservices Pattern**: Independent, scalable service deployment with clear domain boundaries
- **Domain-Driven Design**: Each service represents a distinct business domain (User, Restaurant, Ordering, Logistics)
- **Service Communication**: Services communicate via user-service using HTTP request/response patterns
- **Event Streaming**: **User-service exclusively** uses Spring Cloud Stream and Kafka for messaging events and data streaming
- **Reactive Frontend**: React.js with role-based routing for responsive user experience
- **AI Integration**: LangChain-powered RAG + chatbot for customer ordering assistance via discovery-service


## Notes from project specification
Provide clear, step-by-step instructions on how to configure and run the entire software  project, including Spring Boot applications, Apache Kafka, and any LLM API  configurations. 
sample inputs to demonstrate the use cases (outputs are not necessary) 
