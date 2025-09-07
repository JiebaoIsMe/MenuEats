import { useState } from "react"
import { BotMessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * AITriggerButton - A draggable floating button that toggles the AI chatroom
 * Features:
 * - Draggable positioning anywhere on screen
 * - Starts at bottom-right corner by default
 * - Toggles AI chatroom when clicked (not dragged)
 * - Fixed z-index to stay above other elements
 */
export default function AITriggerButton({ onToggleChatroom }) {
  // Position state for draggable functionality
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Start dragging - record offset from mouse to button position
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // Update button position while dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  // Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Toggle chatroom only if not dragging (prevents accidental opens)
  const handleClick = () => {
    if (!isDragging) {
      onToggleChatroom()
    }
  }

  return (
    <Button 
      variant="secondary" 
      size="icon" 
      className="fixed size-12 z-50 cursor-move shadow-lg hover:shadow-xl transition-shadow"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      <BotMessageSquare />
    </Button>
  )
}