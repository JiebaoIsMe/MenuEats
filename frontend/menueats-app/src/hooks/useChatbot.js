import { useState, useEffect } from 'react'
import { chatbot } from '../services/api'

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initializeRAG = async () => {
      try {
        await chatbot.initialize()
        setInitialized(true)
      } catch (error) {
        console.log('RAG initialization failed:', error)
      }
    }
    initializeRAG()
  }, [])

  return {
    isOpen,
    isMinimized,
    initialized,
    onToggleChatroom: () => setIsOpen(!isOpen),
    onClose: () => setIsOpen(false),
    onMinimize: () => setIsMinimized(!isMinimized)
  }
}