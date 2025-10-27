// Messaging Service EDA Tests - Complete Application Layer Tracing
// Tests each messaging endpoint with full layer flow documentation

const BASE_URL = 'http://localhost:8084/api/users';

// =============================================================================
// MESSAGING OPERATIONS - APPLICATION LAYER TRACING
// =============================================================================

// TEST: POST /users/{senderId}/messages - Send message ( works wihtout kafka)
// APPLICATION LAYER TRACE:
// - commands/: SendMessageCommand
// - handlers/: MessageCommandHandler.handle()
// - adapters/: MessageEventAdapter, ConversationAdapter
// FLOW: REST → MessageController → MessageCommandHandler → MessagingDomainService.sendMessage()
// → Message.create() → MessageSentEvent + ConversationStartedEvent → Kafka(messaging-events)
const messageData = {
    receiverId: 4,
    content: "Testing messaging with full EDA tracing",
    messageType: "TEXT",
    orderId: 123
};

fetch(`${BASE_URL}/2/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData)
})
.then(response => response.json())
.then(data => {
  console.log('POST /users/2/messages - Message Sent:', {
    id: data.id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    content: data.content.substring(0, 30) + '...',
    messageType: data.messageType,
    status: data.status,
    orderId: data.orderId
  });
  // Events: MessageSentEvent, ConversationStartedEvent → messaging-events topic
  window.testMessageId = data.id;
})
.catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/conversations/{otherUserId} - Get conversation ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetConversationQuery
// - handlers/: ConversationQueryHandler.handle()
// - adapters/: ConversationViewAdapter, MessageListAdapter
// FLOW: REST → MessageController → ConversationQueryHandler → MessagingDomainService.getConversation()
// → MessageRepository.findConversationBetween() → Conversation View Model
fetch(`${BASE_URL}/2/conversations/4`)
  .then(response => response.json())
  .then(data => console.log('GET /users/2/conversations/4 - Conversation:', {
    participantIds: '2 ↔ 4',
    messageCount: data.length,
    messages: data.slice(-2).map(m => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content.substring(0, 25) + '...',
      timestamp: m.createdAt
    }))
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/messages/inbox - Get user inbox ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUserInboxQuery
// - handlers/: InboxQueryHandler.handle()
// - adapters/: InboxViewAdapter, MessageSummaryAdapter
// FLOW: REST → MessageController → InboxQueryHandler → MessagingDomainService.getUserInbox()
// → MessageRepository.findRecentConversationsForUser() → Inbox View Model
fetch(`${BASE_URL}/4/messages/inbox`)
  .then(response => response.json())
  .then(data => console.log('GET /users/4/messages/inbox - Inbox:', {
    userId: 4,
    messageCount: data.length,
    recentMessages: data.slice(0, 3).map(m => ({
      id: m.id,
      fromUserId: m.senderId,
      content: m.content.substring(0, 25) + '...',
      timestamp: m.createdAt,
      read: m.read
    }))
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/messages/unread - Get unread messages
// APPLICATION LAYER TRACE:
// - queries/: GetUnreadMessagesQuery
// - handlers/: UnreadMessagesQueryHandler.handle()
// - adapters/: UnreadMessageViewAdapter, NotificationAdapter
// FLOW: REST → MessageController → UnreadMessagesQueryHandler → MessagingDomainService.getUnreadMessages()
// → MessageRepository.findUnreadForUser() → Unread Messages View
fetch(`${BASE_URL}/4/messages/unread`)
  .then(response => response.json())
  .then(data => console.log('GET /users/4/messages/unread - Unread Messages:', {
    userId: 4,
    unreadCount: data.length,
    unreadMessages: data.map(m => ({
      id: m.id,
      fromUserId: m.senderId,
      content: m.content.substring(0, 30) + '...',
      receivedAt: m.createdAt,
      orderRelated: m.orderId ? true : false
    }))
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/messages/unread/count - Get unread count ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetUnreadCountQuery
// - handlers/: UnreadCountQueryHandler.handle()
// - adapters/: CountViewAdapter, BadgeAdapter
// FLOW: REST → MessageController → UnreadCountQueryHandler → MessagingDomainService.getUnreadMessageCount()
// → MessageRepository.countUnreadForUser() → Count Aggregate
fetch(`${BASE_URL}/4/messages/unread/count`)
  .then(response => response.json())
  .then(data => console.log('GET /users/4/messages/unread/count - Unread Count:', {
    userId: 4,
    unreadCount: data.unreadCount,
    hasUnread: data.unreadCount > 0
  }))
  .catch(error => console.error('Error:', error));

// TEST: PUT /users/{userId}/messages/{messageId}/read - Mark message as read ( PASSED )
// APPLICATION LAYER TRACE:
// - commands/: MarkMessageReadCommand
// - handlers/: MessageReadCommandHandler.handle()
// - adapters/: MessageStatusAdapter, ReadReceiptAdapter
// FLOW: REST → MessageController → MessageReadCommandHandler → MessagingDomainService.markMessageAsRead()
// → Message.markAsRead() → MessageReadEvent → Kafka(messaging-events)
const messageId = window.testMessageId || 1;

fetch(`${BASE_URL}/4/messages/${messageId}/read`, {
    method: 'PUT'
})
.then(response => response.json())
.then(data => console.log(`PUT /users/4/messages/${messageId}/read - Message Marked Read:`, {
  messageId: data.id,
  status: data.status,
  readAt: data.readAt,
  read: data.read
}))
.catch(error => console.error('Error:', error));

// TEST: GET /users/{userId}/conversations - Get recent conversations ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetRecentConversationsQuery
// - handlers/: RecentConversationsQueryHandler.handle()
// - adapters/: ConversationSummaryAdapter, ParticipantAdapter
// FLOW: REST → MessageController → RecentConversationsQueryHandler → MessagingDomainService.getRecentConversations()
// → MessageRepository.findRecentConversationsForUser() → Conversation Summary View
fetch(`${BASE_URL}/2/conversations`)
  .then(response => response.json())
  .then(data => console.log('GET /users/2/conversations - Recent Conversations:', {
    userId: 2,
    conversationCount: data.length,
    conversations: data.map(m => ({
      withUserId: m.senderId === 2 ? m.receiverId : m.senderId,
      lastMessage: m.content.substring(0, 25) + '...',
      lastActivity: m.createdAt,
      orderContext: m.orderId
    }))
  }))
  .catch(error => console.error('Error:', error));

// TEST: GET /messages/order/{orderId} - Get order relevant messages  ( PASSED )
// APPLICATION LAYER TRACE:
// - queries/: GetOrderMessagesQuery
// - handlers/: OrderMessageQueryHandler.handle()
// - adapters/: OrderContextAdapter, OrderMessageViewAdapter
// FLOW: REST → MessageController → OrderMessageQueryHandler → MessagingDomainService.getOrderMessages()
// → MessageRepository.findByOrderId() → Order-filtered Message List
fetch(`http://localhost:8084/api/users/messages/order/123`)
  .then(response => response.json())
  .then(data => console.log('GET /messages/order/123 - Order Messages:', {
    orderId: 123,
    messageCount: data.length,
    participants: [...new Set(data.flatMap(m => [m.senderId, m.receiverId]))],
    messages: data.map(m => ({
      id: m.id,
      fromUserId: m.senderId,
      toUserId: m.receiverId,
      content: m.content.substring(0, 30) + '...',
      timestamp: m.createdAt
    }))
  }))
  .catch(error => console.error('Error:', error));


// APPLICATION LAYER COMPONENTS TESTED:
// Commands: SendMessageCommand, MarkMessageReadCommand
// Queries: GetConversationQuery, GetUserInboxQuery, GetUnreadMessagesQuery, GetUnreadCountQuery, GetRecentConversationsQuery, GetOrderMessagesQuery
// Handlers: MessageCommandHandler, ConversationQueryHandler, InboxQueryHandler, UnreadMessagesQueryHandler, UnreadCountQueryHandler, MessageReadCommandHandler, RecentConversationsQueryHandler, OrderMessageQueryHandler
// Adapters: MessageEventAdapter, ConversationAdapter, ConversationViewAdapter, MessageListAdapter, InboxViewAdapter, MessageSummaryAdapter, UnreadMessageViewAdapter, NotificationAdapter, CountViewAdapter, BadgeAdapter, MessageStatusAdapter, ReadReceiptAdapter, ConversationSummaryAdapter, ParticipantAdapter, OrderContextAdapter, OrderMessageViewAdapter