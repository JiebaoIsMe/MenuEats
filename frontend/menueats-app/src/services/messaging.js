// Messaging Service - EDA Integration with User Service
// Connects to user-service on port 8084 for messaging events

const USER_SERVICE_URL = 'http://localhost:8084/api/users'

// Store current user in session for testing
const getCurrentUserId = () => {
  // For testing: get from URL port or localStorage
  const port = window.location.port
  if (port === '3000') return 2  // customer1
  if (port === '3001') return 4  // pizzaowner
  return parseInt(localStorage.getItem('currentUserId')) || 2
}

const getCurrentUserRole = () => {
  const port = window.location.port
  if (port === '3000') return 'CUSTOMER'
  if (port === '3001') return 'BUSINESS_OWNER'
  return localStorage.getItem('currentUserRole') || 'CUSTOMER'
}

export const messagingAPI = {
  // Send message - triggers MessageSentEvent + ConversationStartedEvent
  sendMessage: async (receiverId, content, messageType = 'TEXT', orderId = null) => {
    const senderId = getCurrentUserId()
    const messageData = {
      receiverId,
      content,
      messageType,
      ...(orderId && { orderId })
    }
    
    console.log(`[EDA] Sending message from User ${senderId} to User ${receiverId}`)
    console.log(`[EDA] Expected events: MessageSentEvent → messaging-events topic`)
    
    const response = await fetch(`${USER_SERVICE_URL}/${senderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }
    
    const result = await response.json()
    console.log(`[EDA] Message sent successfully:`, {
      messageId: result.id,
      senderId: result.senderId,
      receiverId: result.receiverId,
      kafkaEvent: 'MessageSentEvent published to messaging-events topic'
    })
    
    return result
  },

  // Get conversation between two users
  getConversation: async (otherUserId) => {
    const currentUserId = getCurrentUserId()
    console.log(`[EDA] Fetching conversation between User ${currentUserId} and User ${otherUserId}`)
    
    const response = await fetch(`${USER_SERVICE_URL}/${currentUserId}/conversations/${otherUserId}`)
    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.status}`)
    }
    
    const messages = await response.json()
    console.log(`[EDA] Conversation loaded: ${messages.length} messages`)
    return messages
  },

  // Get user inbox
  getInbox: async () => {
    const currentUserId = getCurrentUserId()
    console.log(`[EDA] Fetching inbox for User ${currentUserId}`)
    
    const response = await fetch(`${USER_SERVICE_URL}/${currentUserId}/messages/inbox`)
    if (!response.ok) {
      throw new Error(`Failed to get inbox: ${response.status}`)
    }
    
    return await response.json()
  },

  // Get unread messages count
  getUnreadCount: async () => {
    const currentUserId = getCurrentUserId()
    const response = await fetch(`${USER_SERVICE_URL}/${currentUserId}/messages/unread/count`)
    if (!response.ok) {
      throw new Error(`Failed to get unread count: ${response.status}`)
    }
    
    return await response.json()
  },

  // Mark message as read - triggers MessageReadEvent
  markMessageAsRead: async (messageId) => {
    const currentUserId = getCurrentUserId()
    console.log(`[EDA] Marking message ${messageId} as read for User ${currentUserId}`)
    
    const response = await fetch(`${USER_SERVICE_URL}/${currentUserId}/messages/${messageId}/read`, {
      method: 'PUT'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.status}`)
    }
    
    const result = await response.json()
    console.log(`[EDA] Message marked as read - MessageReadEvent may be published`)
    return result
  },

  // Get current user info for testing
  getCurrentUser: () => ({
    userId: getCurrentUserId(),
    role: getCurrentUserRole(),
    port: window.location.port
  })
}

// Real-time polling for demonstration (in production, you'd use WebSockets)
export class MessagePoller {
  constructor(otherUserId, onNewMessage) {
    this.otherUserId = otherUserId
    this.onNewMessage = onNewMessage
    this.lastMessageCount = 0
    this.polling = false
  }

  start() {
    if (this.polling) return
    this.polling = true
    console.log(`[EDA] Starting message polling for User ${this.otherUserId}`)
    this.poll()
  }

  stop() {
    this.polling = false
    console.log(`[EDA] Stopped message polling`)
  }

  async poll() {
    if (!this.polling) return

    try {
      const messages = await messagingAPI.getConversation(this.otherUserId)
      if (messages.length > this.lastMessageCount) {
        const newMessages = messages.slice(this.lastMessageCount)
        newMessages.forEach(msg => {
          console.log(`[EDA] New message detected:`, {
            messageId: msg.id,
            from: msg.senderId,
            to: msg.receiverId,
            content: msg.content.substring(0, 50) + '...',
            receivedViaPolling: true
          })
          this.onNewMessage(msg)
        })
        this.lastMessageCount = messages.length
      }
    } catch (error) {
      console.error('[EDA] Polling error:', error)
    }

    setTimeout(() => this.poll(), 2000) // Poll every 2 seconds
  }
}