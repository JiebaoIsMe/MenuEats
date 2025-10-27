import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import AITriggerButton from "@/components/ui/ai-trigger-button"
import AIChatRoom from "@/components/ui/ai-chatroom"
import RestaurantMenu from "@/components/ui/restaurant-menu"
import OrderCheckout from "@/components/ui/order-checkout"
import { Search, MapPin, ShoppingCart, Bell, Star, Clock, CheckCircle, Truck, ChefHat, Package, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import restaurantApi from '@/services/restaurant'
import orderApi from '@/services/order'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate as useRouterNavigate } from 'react-router-dom'

export default function CustomerHome({ children }) { 
    const navigate = useNavigate()
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const [isChatroomOpen, setIsChatroomOpen] = useState(false)
    const [isChatroomMinimized, setIsChatroomMinimized] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    
    // Restaurant and menu state
    const [restaurants, setRestaurants] = useState([])
    const [loadingRestaurants, setLoadingRestaurants] = useState(true)
    const [restaurantError, setRestaurantError] = useState(null)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [showMenu, setShowMenu] = useState(false)
    
    // Order state
    const [orderData, setOrderData] = useState(null)
    const [showCheckout, setShowCheckout] = useState(false)
    
    // Ongoing order state
    const [ongoingOrders, setOngoingOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const routerNavigate = useRouterNavigate()

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

    // Load restaurants and ongoing orders on component mount
    useEffect(() => {
        loadRestaurants()
        loadOngoingOrders()
        
        // Set up polling for order status updates every 30 seconds
        const intervalId = setInterval(() => {
            if (currentUser?.id) {
                loadOngoingOrders()
            }
        }, 30000)
        
        return () => clearInterval(intervalId)
    }, [currentUser?.id])

    const loadRestaurants = async () => {
        setLoadingRestaurants(true)
        setRestaurantError(null)
        try {
            console.log('[Customer Home] Loading restaurants from backend...')
            const data = await restaurantApi.getAllRestaurants()
            console.log('[Customer Home] Loaded restaurants:', data)
            setRestaurants(data)
        } catch (error) {
            console.error('[Customer Home] Failed to load restaurants from backend:', error)
            setRestaurants([])
            setRestaurantError('Unable to connect to restaurant service. Please ensure the backend is running.')
        } finally {
            setLoadingRestaurants(false)
        }
    }

    const handleViewMenu = (restaurant) => {
        console.log('[Customer Home] Opening menu for:', restaurant.name)
        setSelectedRestaurant(restaurant)
        setShowMenu(true)
    }

    const handleAddToCart = (orderData) => {
        console.log('[Customer Home] Adding to cart:', orderData)
        console.log('[Customer Home] Setting orderData and showCheckout=true')
        setOrderData(orderData)
        setShowMenu(false)
        setShowCheckout(true)
        console.log('[Customer Home] State updated - should show checkout modal')
    }

    const handleOrderComplete = (completedOrder) => {
        console.log('[Customer Home] Order completed:', completedOrder)
        setShowCheckout(false)
        setOrderData(null)
        // Add to ongoing orders
        loadOngoingOrders()
        // Navigate to order confirmation or order history
        navigate(`/order-history?newOrder=${completedOrder.id}`)
    }
    
    // Load ongoing orders from the ordering service
    const loadOngoingOrders = async () => {
        if (!currentUser?.id) {
            setOngoingOrders([])
            return
        }
        
        try {
            setLoadingOrders(true)
            console.log('[Customer Home] Loading ongoing orders for customer:', currentUser.id)
            
            // Get customer orders from ordering service
            const orders = await orderApi.getCustomerOrders(currentUser.id)
            console.log('[Customer Home] Raw orders from API:', orders)
            
            // Filter for ongoing orders (not delivered or cancelled)
            const ongoingOrdersData = orders.filter(order => 
                order.status && !['DELIVERED', 'CANCELLED'].includes(order.status.toUpperCase())
            )
            
            // Transform orders for timeline display
            const transformedOrders = ongoingOrdersData.map(order => ({
                id: order.id,
                orderId: `ORD-${order.id.toString().padStart(3, '0')}`,
                restaurant: `Restaurant ${order.restaurantId}`, // Will be enhanced with actual restaurant name
                items: order.items || [],
                totalAmount: order.totalAmount || 0,
                currentStatus: mapBackendStatusToFrontend(order.status),
                estimatedDelivery: getEstimatedDelivery(order.status),
                orderTime: formatOrderTime(order.createdAt),
                deliveryAddress: order.deliveryAddress,
                timeline: generateTimeline(order.status, order.createdAt)
            }))
            
            console.log('[Customer Home] Transformed ongoing orders:', transformedOrders)
            setOngoingOrders(transformedOrders)
            
        } catch (error) {
            console.error('[Customer Home] Failed to load ongoing orders:', error)
            setOngoingOrders([])
        } finally {
            setLoadingOrders(false)
        }
    }
    
    // Map backend order status to frontend timeline status (using exact database enum values)
    const mapBackendStatusToFrontend = (backendStatus) => {
        const statusMap = {
            'NEW': 'placed',
            'CONFIRMED': 'confirmed', 
            'REJECTED': 'rejected',
            'PREPARING': 'preparing',
            'READY_FOR_PICKUP': 'ready_for_pickup',
            'OUT_FOR_DELIVERY': 'out_for_delivery',
            'DELIVERED': 'delivered',
            'CANCELLED': 'cancelled'
        }
        return statusMap[backendStatus] || 'placed'
    }
    
    // Generate estimated delivery time based on actual order status from database
    const getEstimatedDelivery = (status) => {
        const timeMap = {
            'NEW': '35-45 min',
            'CONFIRMED': '30-40 min',
            'PREPARING': '25-35 min', 
            'READY_FOR_PICKUP': '15-25 min',
            'OUT_FOR_DELIVERY': '10-15 min',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled',
            'REJECTED': 'Rejected'
        }
        return timeMap[status] || '30-40 min'
    }
    
    // Format order time
    const formatOrderTime = (createdAt) => {
        if (!createdAt) return 'Unknown'
        const date = new Date(createdAt)
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        })
    }
    
    // Generate timeline based on exact database order status
    const generateTimeline = (currentStatus, createdAt) => {
        // Handle cancelled/rejected orders with special timeline
        if (['CANCELLED', 'REJECTED'].includes(currentStatus)) {
            return [
                { 
                    status: "placed", 
                    label: "Order Placed", 
                    description: "Your order was successfully placed",
                    completed: true, 
                    time: formatOrderTime(createdAt) 
                },
                { 
                    status: "cancelled", 
                    label: currentStatus === 'CANCELLED' ? "Order Cancelled" : "Order Rejected", 
                    description: currentStatus === 'CANCELLED' ? "Order was cancelled" : "Restaurant declined this order",
                    completed: true, 
                    time: "" 
                }
            ]
        }
        
        // Enhanced timeline with descriptions and estimated times
        const baseTimeline = [
            { 
                status: "placed", 
                label: "Order Placed", 
                description: "Order received and being reviewed",
                completed: false, 
                time: "" 
            },
            { 
                status: "confirmed", 
                label: "Order Confirmed", 
                description: "Restaurant accepted your order",
                completed: false, 
                time: "" 
            },
            { 
                status: "preparing", 
                label: "Preparing Food", 
                description: "Chef is preparing your delicious meal",
                completed: false, 
                time: "" 
            },
            { 
                status: "ready_for_pickup", 
                label: "Ready for Pickup", 
                description: "Food is ready, finding delivery rider",
                completed: false, 
                time: "" 
            },
            { 
                status: "out_for_delivery", 
                label: "Out for Delivery", 
                description: "Rider picked up and heading your way",
                completed: false, 
                time: "" 
            },
            { 
                status: "delivered", 
                label: "Delivered", 
                description: "Enjoy your meal!",
                completed: false, 
                time: "" 
            }
        ]
        
        // Exact database status order progression
        const statusOrder = ['NEW', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED']
        const currentStatusIndex = statusOrder.indexOf(currentStatus)
        
        return baseTimeline.map((step, index) => {
            const isCompleted = index <= currentStatusIndex
            let time = ''
            
            // Set actual order creation time
            if (index === 0 && createdAt) {
                time = formatOrderTime(createdAt)
            }
            
            // Add estimated times for future steps based on current status
            if (!isCompleted && index === currentStatusIndex + 1) {
                const now = new Date()
                const estimatedMinutes = [0, 2, 5, 8, 15, 25][index] || 0
                const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000)
                time = `Est. ${estimatedTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })}`
            }
            
            return {
                ...step,
                completed: isCompleted,
                time
            }
        })
    }
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'placed':
            case 'confirmed':
                return CheckCircle
            case 'preparing':
                return ChefHat
            case 'ready_for_pickup':
                return Package
            case 'out_for_delivery':
                return Truck
            case 'delivered':
                return CheckCircle
            case 'cancelled':
            case 'rejected':
                return X
            default:
                return CheckCircle
        }
    }

    const filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Categories matching actual menu data from backend
    const categories = [
        { name: 'Entree', icon: 'E', description: 'Appetizers & Starters' },
        { name: 'Main', icon: 'M', description: 'Main Courses' },
        { name: 'Dessert', icon: 'D', description: 'Sweet Treats' },
        { name: 'Drink', icon: 'Dr', description: 'Beverages' }
    ]

    // Helper function to get cuisine type from restaurant name
    const getCuisineType = (name) => {
        if (name.toLowerCase().includes('pizza')) return 'Italian'
        if (name.toLowerCase().includes('burger')) return 'American'
        if (name.toLowerCase().includes('sushi')) return 'Japanese'
        if (name.toLowerCase().includes('taco')) return 'Mexican'
        return 'Various'
    }

    // Helper function to get description from restaurant name
    const getDescription = (name) => {
        if (name.toLowerCase().includes('pizza')) return 'Best pizza in town'
        if (name.toLowerCase().includes('burger')) return 'Juicy burgers & fries'
        if (name.toLowerCase().includes('sushi')) return 'Fresh sushi daily'
        if (name.toLowerCase().includes('taco')) return 'Authentic tacos'
        return 'Delicious food awaits'
    }

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 bg-gray-50 min-h-screen">
                    <div className="flex items-center p-4">
                        <SidebarTrigger className="mr-4"/>
                    </div>
                    
                    <div className="p-6 pt-0">
                    {/* Header with Search */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">MenuEats</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Welcome, {currentUser?.username || 'Guest'}!
                                </span>
                                <Bell className="w-6 h-6 text-gray-600" />
                                <ShoppingCart className="w-6 h-6 text-gray-600" />
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold">
                                        {currentUser?.username?.charAt(0).toUpperCase() || 'G'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search for restaurants, cuisines, or dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 text-lg"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">City Center</span>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <div className="flex gap-4 overflow-x-auto">
                            {categories.map((category) => (
                                <div key={category.name} className="flex flex-col items-center min-w-20 cursor-pointer group">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2 hover:bg-yellow-200 transition-colors group-hover:scale-105">
                                        <span className="text-sm font-bold text-gray-700">{category.icon}</span>
                                    </div>
                                    <span className="text-sm text-gray-700 text-center">{category.name}</span>
                                    <span className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {category.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ongoing Order Status */}
                    {ongoingOrders.length > 0 && (
                        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Ongoing Order Status</h2>
                            <div className="space-y-4">
                                {ongoingOrders.map((order) => {
                                    const StatusIcon = getStatusIcon(order.currentStatus)
                                    return (
                                        <Card key={order.id} className="border-yellow-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-semibold">{order.restaurant}</h3>
                                                        <p className="text-sm text-gray-600">Order #{order.orderId} • {order.orderTime}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {order.items.length} items • ${order.totalAmount}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 text-yellow-600">
                                                            <StatusIcon className="w-5 h-5" />
                                                            <span className="text-sm font-medium capitalize">
                                                                {order.currentStatus.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">ETA: {order.estimatedDelivery}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Timeline */}
                                                <div className="relative">
                                                    <div className="flex items-center justify-between">
                                                        {order.timeline.map((step, index) => {
                                                            const StepIcon = getStatusIcon(step.status)
                                                            const isActive = step.status === order.currentStatus
                                                            const isCompleted = step.completed
                                                            
                                                            return (
                                                                <div key={step.status} className="flex flex-col items-center flex-1 relative">
                                                                    {/* Connecting line */}
                                                                    {index < order.timeline.length - 1 && (
                                                                        <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                                                                            isCompleted ? 'bg-yellow-400' : 'bg-gray-200'
                                                                        }`} style={{ transform: 'translateX(50%)' }} />
                                                                    )}
                                                                    
                                                                    {/* Icon circle */}
                                                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                                                        isCompleted 
                                                                            ? 'bg-yellow-400 border-yellow-400 text-white' 
                                                                            : isActive 
                                                                                ? 'bg-yellow-100 border-yellow-400 text-yellow-600'
                                                                                : 'bg-gray-100 border-gray-300 text-gray-400'
                                                                    }`}>
                                                                        <StepIcon className="w-4 h-4" />
                                                                    </div>
                                                                    
                                                                    {/* Label and Description */}
                                                                    <div className="mt-2 text-center max-w-24">
                                                                        <p className={`text-xs font-medium ${
                                                                            isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                                                                        }`}>
                                                                            {step.label}
                                                                        </p>
                                                                        {step.description && (
                                                                            <p className={`text-xs mt-1 ${
                                                                                isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                                                                            }`}>
                                                                                {step.description}
                                                                            </p>
                                                                        )}
                                                                        {step.time && (
                                                                            <p className={`text-xs mt-1 font-medium ${
                                                                                isActive ? 'text-yellow-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                                                            }`}>
                                                                                {step.time}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="flex-1"
                                                        onClick={() => routerNavigate('/order-history', { state: { highlightOrderId: order.id } })}
                                                    >
                                                        View Order
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        Contact Restaurant
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Restaurants */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">All Restaurants</h2>
                            {filteredRestaurants.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} available
                                </span>
                            )}
                        </div>
                        {loadingRestaurants ? (
                            <div className="flex justify-center py-8">
                                <div className="text-lg text-gray-600">Loading restaurants from backend...</div>
                            </div>
                        ) : restaurantError ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <h3 className="font-bold">Restaurant Service Unavailable</h3>
                                <p className="mt-1">{restaurantError}</p>
                                <Button 
                                    onClick={loadRestaurants} 
                                    className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                                    size="sm"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        ) : filteredRestaurants.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No restaurants found matching your search.</p>
                                <Button 
                                    onClick={loadRestaurants} 
                                    className="mt-2"
                                    size="sm"
                                    variant="outline"
                                >
                                    Refresh
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredRestaurants.map((restaurant) => (
                                    <Card key={restaurant.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="w-full h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-600">{restaurant.name.charAt(0)}</span>
                                            </div>
                                            <h3 className="font-semibold">{restaurant.name}</h3>
                                            <p className="text-sm text-gray-600">{getCuisineType(restaurant.name)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{restaurant.location}</p>
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                                <span>4.5</span>
                                                <Clock className="w-3 h-3 ml-2 mr-1" />
                                                <span>25-35 min</span>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewMenu(restaurant)
                                                    }}
                                                >
                                                    View Menu
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewMenu(restaurant)
                                                    }}
                                                >
                                                    Order Now
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {children}
                    </div>
                </main>
            </SidebarProvider>
          
            <AITriggerButton onToggleChatroom={toggleChatroom} />
            <AIChatRoom 
                isOpen={isChatroomOpen}
                onClose={closeChatroom}
                onMinimize={minimizeChatroom}
                isMinimized={isChatroomMinimized}
            />
            
            <RestaurantMenu
                restaurant={selectedRestaurant}
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                onAddToCart={handleAddToCart}
            />
            
            <OrderCheckout
                orderData={orderData}
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onOrderComplete={handleOrderComplete}
            />
        </>
    )
}