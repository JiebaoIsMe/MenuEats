import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Minimize2 } from "lucide-react"
import { useChat } from "@/hooks/useChat"
import ReactMarkdown from 'react-markdown'

/**
 * AIChatRoom - A collapsible/minimizable floating chat panel for AI interactions
 * Features:
 * - Fixed positioning at bottom-right corner
 * - Collapsible (can be minimized to header only)
 * - Close button to hide completely
 * - Scrollable chat history area
 * - Input field for new messages
 * - Sample conversation display
 */
export default function AIChatRoom({ isOpen, onClose, onMinimize, isMinimized }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, loading } = useChat()
  
  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg border border-gray-200 shadow-lg z-40 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-[440px] h-[634px]'
      }`}
    >
      {/* Header with title and control buttons */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg tracking-tight">Chatbot</h2>
          {!isMinimized && <p className="text-sm text-gray-500">Powered by Ollama RAG</p>}
        </div>
        <div className="flex gap-2">
          {/* Minimize/maximize button */}
          <Button variant="ghost" size="sm" onClick={onMinimize}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          {/* Close button */}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat content - only shown when not minimized */}
      {!isMinimized && (
        <>
          <div className="p-4 h-[474px] overflow-y-auto">
            {messages.map(message => (
              <div key={message.id} className="flex gap-3 my-4 text-gray-600 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 border p-1 flex-shrink-0">
                  {message.type === 'ai' ? (
                    <svg stroke="none" fill="black" strokeWidth="1.5" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  ) : (
                    <svg stroke="none" fill="black" strokeWidth="0" viewBox="0 0 16 16" className="w-full h-full">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-gray-700 mb-1">{message.type === 'ai' ? 'AI' : 'You'}</span>
                  <div className="leading-relaxed text-sm max-w-none text-left">
                    <ReactMarkdown 
                      components={{
                        table: ({children}) => (
                          <div className="overflow-x-auto my-3">
                            <table className="min-w-full border-collapse border border-gray-300 text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                        th: ({children}) => (
                          <th className="border border-gray-300 px-2 py-1 font-bold text-left text-xs">
                            {children}
                          </th>
                        ),
                        td: ({children}) => (
                          <td className="border border-gray-300 px-2 py-1 text-xs text-left">
                            {children}
                          </td>
                        ),
                        strong: ({children}) => <strong className="font-bold text-gray-800">{children}</strong>,
                        p: ({children}) => <p className="mb-2 last:mb-0 text-left">{children}</p>,
                        li: ({children}) => <li className="text-left mb-1">{children}</li>,
                        ul: ({children}) => <ul className="text-left list-disc pl-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="text-left list-decimal pl-4 space-y-1">{children}</ol>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 my-4 text-gray-600 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 border p-1 flex-shrink-0">
                  <div className="w-full h-full bg-gray-300 rounded-full animate-pulse" />
                </div>
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-4 border-t">
            <Input 
              placeholder="Ask about restaurants and menus..." 
              className="flex-1" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} variant="outline" size="icon" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}