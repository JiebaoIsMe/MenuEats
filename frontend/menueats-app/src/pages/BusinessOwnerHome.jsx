import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"
import { Store, DollarSign, TrendingUp, Users, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function BusinessOwnerHome({ children }) { 
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const navigate = useNavigate()
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)
    
    // Real data state  
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalSales: 0,
        todayOrders: 0,
        totalCustomers: 0,
        restaurants: 1 // Assuming business owner has at least one restaurant
    })

    const toggleChatroom = () => {
        setIsChatroomOpen(!isChatroomOpen)
        setIsChatroomMinimized(false)
    }

    const closeChatroom = () => {
        setIsChatroomOpen(false)
        setIsChatroomMinimized(false)
    }

    const minimizeChatroom = () => {
        setIsChatroomMinimized(!isChatroomMinimized)
    }

    // Load real data using API from js-tests
    const loadDashboardData = async () => {
        if (!currentUser || currentUser.role !== 'BUSINESS_OWNER') {
            console.log('[Business Owner] No valid business owner user found')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            // Load restaurants owned by this user
            const restaurantsResponse = await fetch(`http://localhost:8084/api/users/${currentUser.id}/restaurants`)
            const restaurants = restaurantsResponse.ok ? await restaurantsResponse.json() : []
            
            // Calculate stats based on restaurants
            let totalSales = 0
            let todayOrders = 0
            let totalCustomers = 0
            
            // For each restaurant, get orders to calculate real stats
            for (const restaurant of restaurants) {
                try {
                    const ordersResponse = await fetch(`http://localhost:8082/api/orders/restaurant/${restaurant.id}`)
                    if (ordersResponse.ok) {
                        const orders = await ordersResponse.json()
                        totalSales += orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                        todayOrders += orders.length
                        
                        // Count unique customers
                        const customerIds = new Set(orders.map(order => order.customerId))
                        totalCustomers += customerIds.size
                    }
                } catch (orderError) {
                    console.warn(`[Business Owner] Failed to load orders for restaurant ${restaurant.id}:`, orderError)
                }
            }
            
            setStats({
                totalSales,
                todayOrders,
                totalCustomers,
                restaurants: restaurants.length
            })
            
            console.log('[Business Owner] Dashboard data loaded:', {
                totalSales,
                todayOrders, 
                totalCustomers,
                restaurants: restaurants.length
            })
            
        } catch (error) {
            console.error('[Business Owner] Failed to load dashboard data:', error)
            setError('Failed to load dashboard data')
            
            // Set fallback stats on error
            setStats({
                totalSales: 0,
                todayOrders: 0,
                totalCustomers: 0,
                restaurants: 0
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount and when user changes
    useEffect(() => {
        loadDashboardData()
    }, [currentUser])


    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 bg-gray-50 min-h-screen">
                    <div className="flex items-center p-4">
                        <SidebarTrigger className="mr-4"/>
                    </div>
                    
                    <div className="p-6 pt-0">
                    {/* Header */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Business Dashboard</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-medium text-gray-700">
                                    Welcome, {currentUser?.username || 'Business Owner'}
                                </span>
                            </div>
                        </div>
                        
                        <p className="text-gray-600">Manage your restaurants and track performance</p>
                    </div>

                    {/* Today's Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Sales</p>
                                        <p className="text-2xl font-bold">
                                            {loading ? '...' : `$${stats.totalSales.toFixed(2)}`}
                                        </p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Orders</p>
                                        <p className="text-2xl font-bold">
                                            {loading ? '...' : stats.todayOrders}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Customers</p>
                                        <p className="text-2xl font-bold">
                                            {loading ? '...' : stats.totalCustomers}
                                        </p>
                                    </div>
                                    <Users className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Restaurants</p>
                                        <p className="text-2xl font-bold">
                                            {loading ? '...' : stats.restaurants}
                                        </p>
                                    </div>
                                    <Store className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>



                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button 
                                variant="outline" 
                                className="p-6 h-auto flex flex-col items-center gap-2"
                                onClick={() => navigate('/edit-restaurant-info')}
                            >
                                <Store className="w-8 h-8 text-yellow-500" />
                                <span>Manage Restaurants</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="p-6 h-auto flex flex-col items-center gap-2"
                                onClick={() => navigate('/manage-menu')}
                            >
                                <Menu className="w-8 h-8 text-yellow-500" />
                                <span>Manage Menu</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="p-6 h-auto flex flex-col items-center gap-2"
                                onClick={() => navigate('/analytics')}
                            >
                                <TrendingUp className="w-8 h-8 text-yellow-500" />
                                <span>View Analytics</span>
                            </Button>
                        </div>
                    </div>

                    {children}
                    </div>
                </main>
            </SidebarProvider>
          
            {/* Chatroom only for customers */}
            {currentUser?.role === 'CUSTOMER' && (
                <>
                    <AITriggerButton onToggleChatroom={toggleChatroom} />
                    <AIChatRoom 
                        isOpen={isChatroomOpen}
                        onClose={closeChatroom}
                        onMinimize={minimizeChatroom}
                        isMinimized={isChatroomMinimized}
                    />
                </>
            )}
        </>
    )
}