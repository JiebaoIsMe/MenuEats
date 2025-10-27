import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Send, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function MessagingPage() {
  const { getCurrentUser } = useAuth()
  const location = useLocation()
  const currentUser = getCurrentUser()
  
  // Get order context from navigation state
  const orderContext = location.state
  
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Load conversations when component mounts or order context changes
  useEffect(() => {
    if (currentUser?.id) {
      loadConversations()
    }
  }, [currentUser?.id, orderContext])

  // Create default conversations based on order context - all participants can message each other
  const createDefaultConversations = () => {
    if (!orderContext?.orderContext || !currentUser) {
      return []
    }

    console.log(`[Messaging] Creating default conversations for order ${orderContext.orderId}`)
    const defaultConversations = []

    // Add all other participants from the order (excluding current user)
    const participants = []
    
    // Add customer if not current user
    if (orderContext.customerId && orderContext.customerId !== currentUser.id) {
      participants.push({
        id: orderContext.customerId,
        role: 'Customer'
      })
    }
    
    // Add restaurant owner if not current user  
    if (orderContext.restaurantId && orderContext.restaurantId !== currentUser.id) {
      participants.push({
        id: orderContext.restaurantId,
        role: 'Restaurant Owner'
      })
    }
    
    // Add rider if order is assigned to one (for now, we'll use a default rider ID if needed)
    // In a real system, you'd fetch the assigned rider from the order details
    
    // Create conversations for all participants
    participants.forEach(participant => {
      defaultConversations.push({
        id: participant.id.toString(),
        partnerId: participant.id,
        name: participant.role,
        lastMessage: {
          content: "Start your conversation by send message now!",
          timestamp: new Date()
        },
        isDefault: true
      })
    })

    return defaultConversations
  }

  // Load conversations from backend
  const loadConversations = async () => {
    if (!currentUser?.id) return
    
    setLoading(true)
    try {
      console.log(`[Messaging] Loading conversations for user ${currentUser.id}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages/inbox`)
      
      let realConversations = []
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[Messaging] Found ${data.length} messages`)
        
        // Group messages by conversation partner
        const conversationMap = new Map()
        
        // Process messages to create conversations with proper display names
        for (const msg of data) {
          const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId
          const key = partnerId.toString()
          
          if (!conversationMap.has(key) || new Date(msg.createdAt) > conversationMap.get(key).lastMessage.timestamp) {
            // Fetch display name for this partner
            try {
              const response = await fetch(`http://localhost:8084/api/users/${partnerId}/display-name`)
              let displayName = `User ${partnerId}`
              if (response.ok) {
                const userData = await response.json()
                displayName = userData.displayName || userData.username || `User ${partnerId}`
              }
              
              conversationMap.set(key, {
                id: key,
                partnerId: partnerId,
                name: displayName,
                lastMessage: {
                  content: msg.content,
                  timestamp: new Date(msg.createdAt)
                },
                isDefault: false
              })
            } catch (error) {
              console.error(`[Messaging] Error fetching display name for ${partnerId}:`, error)
              conversationMap.set(key, {
                id: key,
                partnerId: partnerId,
                name: `User ${partnerId}`,
                lastMessage: {
                  content: msg.content,
                  timestamp: new Date(msg.createdAt)
                },
                isDefault: false
              })
            }
          }
        }
        
        realConversations = Array.from(conversationMap.values())
        console.log(`[Messaging] Processed ${realConversations.length} real conversations`)
      } else {
        console.log('[Messaging] No conversations found or error loading')
      }

      // Add default conversations if coming from order context
      const defaultConversations = createDefaultConversations()
      
      // Merge real and default conversations, prioritizing real ones
      const allConversations = [...realConversations]
      defaultConversations.forEach(defaultConv => {
        if (!realConversations.find(realConv => realConv.partnerId === defaultConv.partnerId)) {
          allConversations.push(defaultConv)
        }
      })
      
      setConversations(allConversations)
      console.log(`[Messaging] Total conversations: ${allConversations.length}`)
      
    } catch (error) {
      console.error('[Messaging] Error loading conversations:', error)
      // If there's an error but we have order context, still show default conversations
      const defaultConversations = createDefaultConversations()
      setConversations(defaultConversations)
    } finally {
      setLoading(false)
    }
  }

  // Load messages for selected conversation
  const loadMessages = async (partnerId) => {
    if (!currentUser?.id || !partnerId) return
    
    try {
      console.log(`[Messaging] Loading messages between ${currentUser.id} and ${partnerId}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages/conversation/${partnerId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[Messaging] Loaded ${data.length} messages`)
        setMessages(data)
      } else {
        console.log('[Messaging] No messages found for this conversation')
        setMessages([])
      }
    } catch (error) {
      console.error('[Messaging] Error loading messages:', error)
      setMessages([])
    }
  }

  // Send a new message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !currentUser?.id) return
    
    const messageData = {
      receiverId: parseInt(selectedChat.partnerId),
      content: messageInput.trim(),
      messageType: 'GENERAL'
    }
    
    try {
      console.log(`[Messaging] Sending message from ${currentUser.id} to ${selectedChat.partnerId}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })
      
      if (response.ok) {
        console.log('[Messaging] Message sent successfully - triggering Kafka event')
        setMessageInput('')
        // Reload messages to show the new one
        await loadMessages(selectedChat.partnerId)
        // Reload conversations to update last message
        await loadConversations()
      } else {
        console.error('[Messaging] Failed to send message')
      }
    } catch (error) {
      console.error('[Messaging] Error sending message:', error)
    }
  }

  // Handle conversation selection
  const selectConversation = (conversation) => {
    console.log(`[Messaging] Selected conversation with ${conversation.name}`)
    setSelectedChat(conversation)
    loadMessages(conversation.partnerId)
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access messaging</p>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-start p-4">
          <SidebarTrigger />
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Messaging</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversation List */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              
              {loading ? (
                <p className="text-gray-500">Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Start your conversation by send message now!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedChat?.id === conversation.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{conversation.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">{selectedChat.name}</h3>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Start your conversation by send message now!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                message.senderId === currentUser.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}