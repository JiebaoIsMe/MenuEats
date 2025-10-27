// useMessaging Hook - EDA Event Tracing for Frontend
// Provides real-time messaging functionality with event logging

import { useState, useEffect, useCallback } from 'react'
import { messagingAPI, MessagePoller } from '../services/messaging'

export function useMessaging(otherUserId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser] = useState(() => messagingAPI.getCurrentUser())
  const [poller, setPoller] = useState(null)

  // Load conversation on mount
  useEffect(() => {
    if (otherUserId) {
      loadConversation()
      loadUnreadCount()
    }
  }, [otherUserId])

  // Set up real-time polling
  useEffect(() => {
    if (otherUserId && !poller) {
      const newPoller = new MessagePoller(otherUserId, handleNewMessage)
      setPoller(newPoller)
      newPoller.start()

      return () => {
        newPoller.stop()
      }
    }
  }, [otherUserId])

  const loadConversation = async () => {
    if (!otherUserId) return
    
    setLoading(true)
    try {
      console.log(`[EDA Frontend] Loading conversation between User ${currentUser.userId} and User ${otherUserId}`)
      const conversationMessages = await messagingAPI.getConversation(otherUserId)
      setMessages(conversationMessages)
      console.log(`[EDA Frontend] Loaded ${conversationMessages.length} messages`)
    } catch (error) {
      console.error('[EDA Frontend] Failed to load conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const countData = await messagingAPI.getUnreadCount()
      setUnreadCount(countData.unreadCount)
    } catch (error) {
      console.error('[EDA Frontend] Failed to load unread count:', error)
    }
  }

  const sendMessage = async (content, messageType = 'TEXT', orderId = null) => {
    if (!content.trim() || !otherUserId) return

    setLoading(true)
    try {
      console.log(`[EDA Frontend] User ${currentUser.userId} (${currentUser.role}) sending message`)
      console.log(`[EDA Frontend] Backend will publish: MessageSentEvent → messaging-events topic`)
      
      const newMessage = await messagingAPI.sendMessage(otherUserId, content, messageType, orderId)
      
      // Add to local state immediately for responsive UI
      setMessages(prev => [...prev, newMessage])
      
      console.log(`[EDA Frontend] Message sent successfully:`, {
        messageId: newMessage.id,
        flow: `Frontend → User-Service → Kafka Events`,
        kafkaTopics: ['messaging-events'],
        expectedEvents: ['MessageSentEvent', 'ConversationStartedEvent (if first message)']
      })
      
      return newMessage
    } catch (error) {
      console.error('[EDA Frontend] Failed to send message:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId) => {
    try {
      console.log(`[EDA Frontend] Marking message ${messageId} as read`)
      await messagingAPI.markMessageAsRead(messageId)
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true, readAt: new Date().toISOString() } : msg
        )
      )
      
      loadUnreadCount() // Refresh count
    } catch (error) {
      console.error('[EDA Frontend] Failed to mark message as read:', error)
    }
  }

  const handleNewMessage = useCallback((newMessage) => {
    console.log(`[EDA Frontend] Real-time message received:`, {
      messageId: newMessage.id,
      from: newMessage.senderId,
      via: 'Frontend Polling → User-Service API',
      originatedFrom: 'Kafka MessageSentEvent'
    })
    
    setMessages(prev => {
      // Check if message already exists (avoid duplicates)
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev
      }
      return [...prev, newMessage]
    })
    
    loadUnreadCount() // Update unread count
  }, [])

  return {
    messages,
    loading,
    unreadCount,
    currentUser,
    sendMessage,
    markAsRead,
    loadConversation,
    // EDA Testing helpers
    edaInfo: {
      userService: 'http://localhost:8084/api/users',
      kafkaTopics: ['messaging-events', 'user-events', 'status-events'],
      currentUser: currentUser,
      otherUser: otherUserId,
      events: {
        send: 'MessageSentEvent + ConversationStartedEvent',
        read: 'MessageReadEvent (if implemented)',
        poll: 'No events - just query operations'
      }
    }
  }
}