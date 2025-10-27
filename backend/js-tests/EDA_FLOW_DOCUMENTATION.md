# Event-Driven Architecture Flow Documentation

## Application Layer Data Flow Tracing

This document traces the complete data flow through all application layers for the MenuEats user-service Event-Driven Architecture implementation.

---

## Layer Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  REST Controllers (UserController, MessageController, etc.)     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │  Commands   │ │   Queries   │ │   Handlers  │ │ Adapters  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    DOMAIN LAYER                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────────────────┐ │
│  │    User     │ │  Messaging  │ │         Status             │ │
│  │   Domain    │ │   Domain    │ │        Domain              │ │
│  └─────────────┘ └─────────────┘ └────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                             │
│  Database Repositories │ Kafka Event Publishers │ External APIs │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Traces by Operation

### 1. User Registration Flow

**REST Endpoint:** `POST /api/users`

**Complete Layer Trace:**
```
REST Request
│
├─ UserController.createUser()
│  │
│  ├─ CreateUserCommand (Application Layer)
│  │  ├─ senderId: Long
│  │  ├─ username: String
│  │  ├─ email: String
│  │  ├─ role: String
│  │
│  ├─ UserCommandHandler.handle() (Application Layer)
│  │  ├─ Validation: UserDomainService.validateUserCreation()
│  │  ├─ Domain Operation: User.create()
│  │  ├─ Persistence: UserRepository.save()
│  │  ├─ Event: UserRegisteredEvent
│  │
│  ├─ UserCreationAdapter (Application Layer)
│  │  ├─ Maps: Domain User → REST Response
│  │  ├─ Enriches: Profile information
│  │
│  ├─ UserEventAdapter (Application Layer)
│  │  ├─ Converts: UserRegisteredEvent → Kafka Message
│  │  ├─ Routes: user-events topic
│  │
│  └─ Domain Events Published:
│     ├─ UserRegisteredEvent → user-events (Kafka)
│     └─ Triggers: Cross-domain initialization
```

**Cross-Domain Reactions:**
- **Status Domain:** Initialize UserStatus for new user
- **Messaging Domain:** Create MessagingCapability for new user
- **Notification Domain:** Send welcome notifications

---

### 2. Message Sending Flow

**REST Endpoint:** `POST /api/users/{senderId}/messages`

**Complete Layer Trace:**
```
REST Request
│
├─ MessageController.sendMessage()
│  │
│  ├─ SendMessageCommand (Application Layer)
│  │  ├─ senderId: UserId
│  │  ├─ receiverId: UserId
│  │  ├─ content: String
│  │  ├─ messageType: String
│  │  ├─ orderId: Long
│  │
│  ├─ MessageCommandHandler.handle() (Application Layer)
│  │  ├─ Validation: User existence check
│  │  ├─ Business Rules: MessagingDomainService.canUserSendMessage()
│  │  ├─ Domain Operation: MessagingDomainService.sendMessage()
│  │  │  ├─ Aggregate: Message.create()
│  │  │  ├─ Repository: MessageRepository.save()
│  │  │  ├─ Events: MessageSentEvent, ConversationStartedEvent
│  │
│  ├─ MessageEventAdapter (Application Layer)
│  │  ├─ Converts: Domain Events → Kafka Messages
│  │  ├─ Routes: messaging-events topic
│  │
│  ├─ ConversationAdapter (Application Layer)
│  │  ├─ Maps: Message → ConversationView
│  │  ├─ Updates: Conversation metadata
│  │
│  └─ Domain Events Published:
│     ├─ MessageSentEvent → messaging-events (Kafka)
│     ├─ ConversationStartedEvent → messaging-events (Kafka)
│     └─ Triggers: Cross-domain updates
```

**Cross-Domain Reactions:**
- **Status Domain:** Update sender's last activity time
- **User Domain:** Increment user interaction count
- **Notification Domain:** Send message notifications
- **Order Domain:** Link message to order context (if orderId present)

---

### 3. Status Update Flow

**REST Endpoint:** `PUT /api/users/{userId}/status`

**Complete Layer Trace:**
```
REST Request
│
├─ StatusController.updateUserStatus()
│  │
│  ├─ UpdateUserStatusCommand (Application Layer)
│  │  ├─ userId: UserId
│  │  ├─ status: String
│  │  ├─ platform: String
│  │
│  ├─ UserStatusCommandHandler.handle() (Application Layer)
│  │  ├─ Validation: User existence check
│  │  ├─ Domain Operation: StatusDomainService.updateUserStatus()
│  │  │  ├─ Aggregate: UserStatus.updateStatus()
│  │  │  ├─ Repository: UserStatusRepository.save()
│  │  │  ├─ Event: StatusChangedEvent
│  │
│  ├─ StatusEventAdapter (Application Layer)
│  │  ├─ Converts: StatusChangedEvent → Kafka Message
│  │  ├─ Routes: status-events topic
│  │
│  ├─ PresenceAdapter (Application Layer)
│  │  ├─ Maps: UserStatus → PresenceView
│  │  ├─ Updates: Real-time presence indicators
│  │
│  └─ Domain Events Published:
│     ├─ StatusChangedEvent → status-events (Kafka)
│     └─ Triggers: Availability updates across domains
```

**Cross-Domain Reactions:**
- **Messaging Domain:** Update user availability for messaging
- **User Domain:** Update user presence information
- **Real-time Domain:** Broadcast presence changes via WebSocket

---

### 4. Query Operations Flow

**REST Endpoint:** `GET /api/users/{userId}/conversations/{otherUserId}`

**Complete Layer Trace:**
```
REST Request
│
├─ MessageController.getConversation()
│  │
│  ├─ GetConversationQuery (Application Layer)
│  │  ├─ userId1: UserId
│  │  ├─ userId2: UserId
│  │
│  ├─ ConversationQueryHandler.handle() (Application Layer)
│  │  ├─ Domain Query: MessagingDomainService.getConversation()
│  │  │  ├─ Repository: MessageRepository.findConversationBetween()
│  │  │  ├─ Domain Logic: Message ordering, filtering
│  │
│  ├─ ConversationViewAdapter (Application Layer)
│  │  ├─ Maps: Domain Messages → ConversationView
│  │  ├─ Enriches: Participant information
│  │  ├─ Formats: Timestamps, read status
│  │
│  ├─ MessageListAdapter (Application Layer)
│  │  ├─ Optimizes: Message list for client consumption
│  │  ├─ Filters: Sensitive information
│  │
│  └─ Response: Optimized conversation view
```

**No Events Published** (Read-only operation following CQRS pattern)

---

## Event Choreography Patterns

### Pattern 1: User Lifecycle Events

```
UserRegisteredEvent (user-events)
├─ StatusContext: Initialize user status
├─ MessagingContext: Create messaging capabilities  
├─ NotificationContext: Send welcome messages
└─ AnalyticsContext: Track user acquisition
```

### Pattern 2: Communication Events

```
MessageSentEvent (messaging-events)
├─ StatusContext: Update sender activity
├─ UserContext: Update interaction metrics
├─ NotificationContext: Notify recipient
└─ OrderContext: Link to order (if applicable)
```

### Pattern 3: Presence Events

```
StatusChangedEvent (status-events)
├─ MessagingContext: Update availability
├─ UserContext: Update presence
├─ RealTimeContext: Broadcast to connected clients
└─ AnalyticsContext: Track usage patterns
```

---

## Application Layer Component Summary

### Commands (Write Operations)
- `CreateUserCommand` - User registration
- `UpdateUserCommand` - User information updates
- `SendMessageCommand` - Message sending
- `UpdateUserStatusCommand` - Status changes
- `StartTypingCommand` - Typing indicators
- `MarkMessageReadCommand` - Message read receipts

### Queries (Read Operations)
- `GetConversationQuery` - Conversation history
- `GetUnreadMessagesQuery` - Unread message lists
- `GetOnlineUsersQuery` - Active user status
- `GetUserByIdQuery` - User information lookup
- `GetOrderMessagesQuery` - Order-related communications

### Handlers (Business Logic)
- `UserCommandHandler` - User domain operations
- `MessageCommandHandler` - Messaging operations
- `StatusCommandHandler` - Status management
- `ConversationQueryHandler` - Conversation queries
- `CrossDomainEventHandler` - Inter-domain coordination

### Adapters (Data Translation)
- `UserEventAdapter` - User events to Kafka
- `MessageEventAdapter` - Message events to Kafka
- `StatusEventAdapter` - Status events to Kafka
- `ConversationViewAdapter` - Domain to view mapping
- `RealTimeAdapter` - Real-time notifications
- `OrderContextAdapter` - Order system integration

---

## Kafka Event Topics

### user-events
**Events:** UserRegisteredEvent, UserUpdatedEvent, UserDeactivatedEvent
**Consumers:** Status Service, Messaging Service, Analytics Service

### messaging-events
**Events:** MessageSentEvent, ConversationStartedEvent, MessageReadEvent
**Consumers:** User Service, Status Service, Notification Service

### status-events
**Events:** StatusChangedEvent, TypingEvent, PresenceUpdateEvent
**Consumers:** Messaging Service, Real-time Service, Analytics Service

---

## Testing Strategy

Each test file traces the complete flow:

1. **user-service-eda.js** - Tests all user CRUD operations with layer tracing
2. **messaging-service-eda.js** - Tests messaging operations with event flows
3. **user-status-service-eda.js** - Tests status operations with cross-domain effects
4. **messaging-realtime-eda.js** - Tests real-time scenarios with full EDA patterns
5. **cross-domain-events-trace.js** - Tests event choreography across domains

Each test includes:
- Complete application layer trace
- Event publication verification
- Cross-domain reaction testing
- Kafka topic monitoring instructions

This architecture demonstrates graduate-level understanding of:
- Domain-Driven Design with bounded contexts
- CQRS with command/query separation
- Event-driven architecture with event sourcing
- Microservice patterns within a monolith
- Cross-domain event choreography