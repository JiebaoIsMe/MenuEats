import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Send, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function RiderMessaging() {
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

  // Fetch display name for a given user ID using enhanced endpoint
  const fetchDisplayName = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8084/api/users/${userId}/display-name`)
      if (response.ok) {
        const userData = await response.json()
        return userData.displayName || userData.username || `User ${userId}`
      }
    } catch (error) {
      console.error(`[RiderMessaging] Error fetching display name for ${userId}:`, error)
    }
    return `User ${userId}`
  }

  // Create default conversations for rider using order participants
  const createDefaultConversations = async () => {
    if (!orderContext?.orderContext || !currentUser || !orderContext.orderId) {
      return []
    }

    console.log(`[RiderMessaging] Creating default conversations for order ${orderContext.orderId}`)
    const defaultConversations = []

    try {
      // Get order participants from backend
      const response = await fetch(`http://localhost:8084/api/users/${orderContext.orderId}/participants`)
      if (response.ok) {
        const participants = await response.json()
        console.log(`[RiderMessaging] Order participants:`, participants)

        // Add customer conversation
        if (participants.customer && participants.customer.id !== currentUser.id) {
          defaultConversations.push({
            id: participants.customer.id.toString(),
            partnerId: participants.customer.id,
            name: participants.customer.displayName,
            role: participants.customer.role,
            lastMessage: {
              content: "Start your conversation by send message now!",
              timestamp: new Date()
            },
            isDefault: true
          })
        }

        // Add restaurant owner conversation
        if (participants.restaurantOwner && participants.restaurantOwner.id !== currentUser.id) {
          defaultConversations.push({
            id: participants.restaurantOwner.id.toString(),
            partnerId: participants.restaurantOwner.id,
            name: participants.restaurantOwner.displayName,
            role: participants.restaurantOwner.role,
            lastMessage: {
              content: "Start your conversation by send message now!",
              timestamp: new Date()
            },
            isDefault: true
          })
        }
      } else {
        console.log('[RiderMessaging] Failed to fetch order participants, falling back to order context')
        
        // Fallback: Add participants using order context
        if (orderContext.customerId && orderContext.customerId !== currentUser.id) {
          const displayName = await fetchDisplayName(orderContext.customerId)
          defaultConversations.push({
            id: orderContext.customerId.toString(),
            partnerId: orderContext.customerId,
            name: displayName,
            role: 'Customer',
            lastMessage: {
              content: "Start your conversation by send message now!",
              timestamp: new Date()
            },
            isDefault: true
          })
        }
        
        if (orderContext.restaurantId && orderContext.restaurantId !== currentUser.id) {
          const displayName = await fetchDisplayName(orderContext.restaurantId)
          defaultConversations.push({
            id: orderContext.restaurantId.toString(),
            partnerId: orderContext.restaurantId,
            name: displayName,
            role: 'Restaurant Owner',
            lastMessage: {
              content: "Start your conversation by send message now!",
              timestamp: new Date()
            },
            isDefault: true
          })
        }
      }
    } catch (error) {
      console.error('[RiderMessaging] Error fetching order participants:', error)
    }

    return defaultConversations
  }

  // Load conversations from backend
  const loadConversations = async () => {
    if (!currentUser?.id) return
    
    setLoading(true)
    try {
      console.log(`[RiderMessaging] Loading conversations for rider ${currentUser.id}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages/inbox`)
      
      let realConversations = []
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[RiderMessaging] Found ${data.length} messages`)
        
        // Group messages by conversation partner
        const conversationMap = new Map()
        
        for (const msg of data) {
          const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId
          const key = partnerId.toString()
          
          if (!conversationMap.has(key) || new Date(msg.createdAt) > conversationMap.get(key).lastMessage.timestamp) {
            const displayName = await fetchDisplayName(partnerId)
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
          }
        }
        
        realConversations = Array.from(conversationMap.values())
        console.log(`[RiderMessaging] Processed ${realConversations.length} real conversations`)
      } else {
        console.log('[RiderMessaging] No conversations found or error loading')
      }

      // Add default conversations if coming from order context
      const defaultConversations = await createDefaultConversations()
      
      // Merge real and default conversations, prioritizing real ones
      const allConversations = [...realConversations]
      defaultConversations.forEach(defaultConv => {
        if (!realConversations.find(realConv => realConv.partnerId === defaultConv.partnerId)) {
          allConversations.push(defaultConv)
        }
      })
      
      setConversations(allConversations)
      console.log(`[RiderMessaging] Total conversations: ${allConversations.length}`)
      
    } catch (error) {
      console.error('[RiderMessaging] Error loading conversations:', error)
      // If there's an error but we have order context, still show default conversations
      const defaultConversations = await createDefaultConversations()
      setConversations(defaultConversations)
    } finally {
      setLoading(false)
    }
  }

  // Load messages for selected conversation
  const loadMessages = async (partnerId) => {
    if (!currentUser?.id || !partnerId) return
    
    try {
      console.log(`[RiderMessaging] Loading messages between ${currentUser.id} and ${partnerId}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/conversations/${partnerId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[RiderMessaging] Loaded ${data.length} messages`)
        setMessages(data)
      } else {
        console.log('[RiderMessaging] No messages found for this conversation')
        setMessages([])
      }
    } catch (error) {
      console.error('[RiderMessaging] Error loading messages:', error)
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
      console.log(`[RiderMessaging] Sending message from ${currentUser.id} to ${selectedChat.partnerId}`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })
      
      if (response.ok) {
        console.log('[RiderMessaging] Message sent successfully - triggering Kafka event')
        setMessageInput('')
        // Reload messages to show the new one
        await loadMessages(selectedChat.partnerId)
        // Reload conversations to update last message
        await loadConversations()
      } else {
        console.error('[RiderMessaging] Failed to send message')
      }
    } catch (error) {
      console.error('[RiderMessaging] Error sending message:', error)
    }
  }

  // Handle conversation selection
  const selectConversation = (conversation) => {
    console.log(`[RiderMessaging] Selected conversation with ${conversation.name}`)
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Rider Messaging</h1>
          
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
                          {conversation.role && (
                            <p className="text-xs text-orange-600">{conversation.role}</p>
                          )}
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
                    {selectedChat.role && (
                      <p className="text-sm text-orange-600">{selectedChat.role}</p>
                    )}
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
                                  ? 'bg-orange-600 text-white'
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