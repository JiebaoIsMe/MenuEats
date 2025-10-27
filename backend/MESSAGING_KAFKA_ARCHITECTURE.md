# Messaging Kafka Architecture

## Service Design
**User Service** handles both user management and messaging (merged for efficiency)

## Kafka Topics
- `user-messages` - Chat messages between users
- `user-events` - Login, logout, typing, online status  
- `message-status` - Delivery confirmations, read receipts
- `user-discovery` - User search for chat initiation

## User Service Responsibilities

### Producer (Sends Events)
- Chat messages between users
- User login/logout events
- Typing indicators and online status
- Message delivery confirmations
- User search queries

### Consumer (Receives Events)
- Store incoming messages
- Update user online status
- Handle message read receipts
- Process user search requests
- Update chat lists and notifications

## Message Flow
```
User A sends message → User Service → user-messages topic → User Service → User B receives
```

## Key Benefits
- Single service for user + messaging = simpler architecture
- No inter-service calls for message validation
- Better performance and easier development
- Unified user domain (identity + communication)