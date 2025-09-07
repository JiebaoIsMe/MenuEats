import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"

/**
 * HomePage - Main layout component with sidebar and AI chat functionality
 * Features:
 * - Sidebar navigation with AppSidebar component
 * - Floating AI trigger button (draggable)
 * - Collapsible AI chatroom panel
 * - State management for chatroom visibility and minimization
 * - AI components positioned outside sidebar for independent floating behavior
 */
export default function HomePage({ children }) { 
    // State for controlling AI chatroom visibility and minimization
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)

    // Toggle chatroom open/closed state
    const toggleChatroom = () => {
        setIsChatroomOpen(!isChatroomOpen)
        setIsChatroomMinimized(false) // Always expand when toggling
    }

    // Close chatroom completely
    const closeChatroom = () => {
        setIsChatroomOpen(false)
        setIsChatroomMinimized(false)
    }

    // Toggle between minimized and expanded chatroom
    const minimizeChatroom = () => {
        setIsChatroomMinimized(!isChatroomMinimized)
    }

    return (
        <>
            {/* Main sidebar layout */}
            <SidebarProvider>
            <AppSidebar />
                <main>
                    <SidebarTrigger/>
                    {children}
                </main>
          </SidebarProvider>
          
          {/* AI components - positioned outside sidebar for floating behavior */}
          <AITriggerButton onToggleChatroom={toggleChatroom} />
          <AIChatRoom 
            isOpen={isChatroomOpen}
            onClose={closeChatroom}
            onMinimize={minimizeChatroom}
            isMinimized={isChatroomMinimized}
          />
        </>
    )
}