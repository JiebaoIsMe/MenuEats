import { useState } from 'react'
import { chatbot } from '../services/api'

export function useChat() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi, how can I help you today?' }
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text) => {
    const userMessage = { id: Date.now(), type: 'user', text }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await chatbot.chat(text)
      const aiMessage = { id: Date.now() + 1, type: 'ai', text: response.response }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, type: 'ai', text: 'Sorry, something went wrong.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return { messages, sendMessage, loading }
}