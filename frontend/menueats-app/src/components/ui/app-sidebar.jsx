import { useState, useEffect } from "react"
import { 
  BotMessageSquare,
  ChefHat, 
  Inbox, 
  Search, 
  Settings, 
  User2, 
  ChevronUp, 
} from "lucide-react"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,  
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // Use authenticated user or fallback to port-based detection
  const currentUser = user || (() => {
    // ====================================================================
    // TODO: REMOVE MOCK FUNCTION - Fallback for backward compatibility
    // ====================================================================
    const port = window.location.port
    if (port === '3000') {
      return { id: 2, username: 'customer1', role: 'CUSTOMER' }
    } else if (port === '3001') {
      return { id: 4, username: 'pizzaowner', role: 'BUSINESS_OWNER' }
    } else if (port === '3002') {
      return { id: 1, username: 'rider1', role: 'RIDER' }
    }
    return null
    // ====================================================================
    // END MOCK FUNCTION - Port-based User Detection
    // ====================================================================
  })()

  // Load unread count ONCE only - NO POLLING to prevent messaging interference
  useEffect(() => {
    if (currentUser) {
      loadUnreadCount()
      // NO POLLING - static count only
    }
  }, [currentUser?.id]) // Only trigger on user ID change

  const loadUnreadCount = async () => {
    if (!currentUser) {
      console.log('[Sidebar] No current user, skipping unread count')
      return
    }
    
    try {
      console.log(`[Sidebar] Loading unread count for user ${currentUser.id} (${currentUser.role})`)
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages/unread/count`)
      if (response.ok) {
        const data = await response.json()
        console.log(`[Sidebar] Unread count response:`, data)
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.warn(`[Sidebar] Failed to load unread count: ${response.status}`)
      }
    } catch (error) {
      console.error('[Sidebar] Failed to load unread count:', error)
    }
  }

  // Menu items based on user role
  const getMenuItems = () => {
    // Role-specific order history routes
    const getOrderHistoryUrl = () => {
      switch (currentUser?.role) {
        case 'CUSTOMER':
          return '/customer-order-history'
        case 'BUSINESS_OWNER':
          return '/business-order-history'
        case 'RIDER':
          return '/rider-order-history'
        default:
          return '/customer-order-history' // fallback
      }
    }

    // Role-specific messaging routes
    const getMessagingUrl = () => {
      switch (currentUser?.role) {
        case 'CUSTOMER':
          return '/customer-messaging'
        case 'BUSINESS_OWNER':
          return '/business-messaging'
        case 'RIDER':
          return '/rider-messaging'
        default:
          return '/customer-messaging' // fallback
      }
    }

    const baseItems = [
      {
        title: "Orders",
        url: getOrderHistoryUrl(),
        icon: ChefHat,
      },
      {
        title: "Messaging",
        url: getMessagingUrl(),
        icon: Inbox,
        badge: unreadCount > 0 ? unreadCount : null
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
      },
    ]

    return baseItems
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <p> MenuEats </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <div className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> 
                    <span>{currentUser?.username || 'Username'}</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                  <Link to="/profile">
                        <span> Profile </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button 
                      onClick={async () => {
                        console.log('[SIDEBAR] Signing out...')
                        await logout()
                        navigate('/login')
                      }}
                      className="w-full text-left"
                    >
                      <span>Sign Out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

