// Event-Driven Architecture - Messaging Events Only
// Tests only meaningful business events, not CRUD operations
// Run in browser console

const BASE_URL = 'http://localhost:8084/api';

// TEST SEND MSG
// Test script for sending a message
const senderId = 4;
const receiverId = 2;

const messageData = {
  receiverId: receiverId,
  content: "Hello! This is a test message.",
  messageType: "TEXT",
  orderId: null
};

fetch(`http://localhost:8080/${senderId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(messageData)
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to send message: ' + response.status);
    }
  })
  .then(data => {
    console.log('Message sent successfully:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  
  
// console.log('Note: CRUD operations should NOT trigger events - only business-significant actions');

// =============================================================================
// TEST 1: MESSAGE SENT EVENT (Meaningful Business Event) ( PASSED )
// =============================================================================
// console.log('1. Testing MessageSentEvent - triggers cross-domain reactions...'); 

const messageData = {
    receiverId: 4,
    content: "Testing meaningful business events only - no CRUD events",
    messageType: "TEXT",
    orderId: 999
};

fetch(`${BASE_URL}/users/2/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData)
})
.then(response => response.json())
.then(message => {
    console.log('✅ Message Sent (triggers MessageSentEvent + ConversationStartedEvent):', {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content.substring(0, 50) + '...',
        messageType: message.messageType,
        status: message.status,
        orderId: message.orderId
    });
    // Events Published:
    // - MessageSentEvent → messaging-events topic
    // - ConversationStartedEvent → messaging-events topic (if first message)
    
    window.testMessageId = message.id;
})
.catch(error => console.error('❌ Error:', error));

// =============================================================================
// TEST 2: MESSAGE READ EVENT (Meaningful Business Event) ( PASSED )
// =============================================================================
console.log('2. Testing MessageReadEvent - triggers delivery confirmation...');

// Use the message ID from previous test or fallback
const messageId = window.testMessageId || 1;

fetch(`${BASE_URL}/users/4/messages/${messageId}/read`, {
    method: 'PUT'
})
.then(response => response.json())
.then(data => {
    console.log('✅ Message Marked Read (could trigger MessageReadEvent):', {
        messageId: data.id,
        status: data.status,
        read: data.read,
        readAt: data.readAt
    });
    // Note: MessageReadEvent implementation depends on business requirements
})
.catch(error => console.error('❌ Error:', error));

// =============================================================================
// TEST 3: ORDER-CONTEXT MESSAGING (Business-Relevant Event) ( PASSED )
// =============================================================================
console.log('3. Testing Order-Context Messages - meaningful for order coordination...');

const orderMessageData = {
    receiverId: 4, // Use existing user (business owner)
    content: "Order #456 is ready for pickup",
    messageType: "ORDER_UPDATE",
    orderId: 456
};

fetch(`${BASE_URL}/users/5/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderMessageData)
})
.then(response => response.json())
.then(message => {
    console.log('✅ Order Message Sent (triggers MessageSentEvent):', {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageType: message.messageType,
        orderId: message.orderId
    });
})
.catch(error => console.error('❌ Error:', error));

// =============================================================================
// TEST 4: CONVERSATION QUERY (No Events - Just Data Retrieval) ( PASSED )
// =============================================================================
console.log('4. Testing Conversation Query - NO events (just data access)...');

fetch(`${BASE_URL}/users/2/conversations/4`)
.then(response => response.json())
.then(conversation => {
    console.log('✅ Conversation Retrieved (No events - just query):', {
        messageCount: conversation.length,
        latestMessage: conversation[conversation.length - 1]?.content?.substring(0, 30) + '...',
        participants: '2 ↔ 4'
    });
    // CQRS Query Pattern: Optimized read without business logic or events
})
.catch(error => console.error('❌ Error:', error));

// =============================================================================
// TEST 5: ORDER MESSAGES QUERY (No Events - Just Data Retrieval) ( PASSED )
// =============================================================================
console.log('5. Testing Order Message Query - NO events (just data filtering)...');

fetch(`${BASE_URL}/users/messages/order/456`)
.then(response => response.json())
.then(orderMessages => {
    console.log('✅ Order Messages Retrieved (No events - just query):', {
        orderId: 456,
        messageCount: orderMessages.length,
        participants: [...new Set(orderMessages.flatMap(m => [m.senderId, m.receiverId]))]
    });
    // Domain Logic: Messages filtered by business context (Order) - no events needed
})
.catch(error => console.error('❌ Error:', error));
