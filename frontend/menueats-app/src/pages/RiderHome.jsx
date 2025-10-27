import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { MapPin, Clock, DollarSign, Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import orderApi from '@/services/order'

export default function RiderHome({ children }) { 
    const { getCurrentUser } = useAuth()
    const currentUser = getCurrentUser()
    const [isOnline, setIsOnline] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [activeDeliveries, setActiveDeliveries] = useState([])
    const [availableOrders, setAvailableOrders] = useState([])

    // Load active deliveries and available orders
    useEffect(() => {
        if (currentUser?.id) {
            loadActiveDeliveries()
            loadAvailableOrders()
            
            // Set up polling for delivery updates every 15 seconds
            const intervalId = setInterval(() => {
                loadActiveDeliveries()
                loadAvailableOrders()
            }, 15000)
            
            return () => clearInterval(intervalId)
        }
    }, [currentUser?.id])
    
    const loadActiveDeliveries = async () => {
        if (!currentUser?.id) return
        
        try {
            const riderId = currentUser.id
            console.log(`[RiderHome] Loading deliveries for rider ${riderId} from database`)
            
            // Get rider's assigned deliveries from logistics service via user service proxy
            const logisticsResponse = await fetch(`http://localhost:8084/api/logistics/riders/${riderId}/deliveries`)
            if (!logisticsResponse.ok) {
                throw new Error(`Failed to get rider deliveries: ${logisticsResponse.status}`)
            }
            
            const riderDeliveries = await logisticsResponse.json()
            console.log('[RiderHome] Rider deliveries from logistics:', riderDeliveries)
            
            // Transform logistics deliveries to get full order details
            const transformedDeliveries = await Promise.all(
                riderDeliveries.map(async (delivery) => {
                    // Get full order details from ordering service via user service proxy
                    const orderResponse = await fetch(`http://localhost:8084/api/user-orders/${delivery.orderId}`)
                    if (!orderResponse.ok) {
                        console.warn(`Could not fetch order ${delivery.orderId}:`, orderResponse.status)
                        return null
                    }
                    
                    const orderData = await orderResponse.json()
                    
                    // Get customer details from user service
                    let customerName = `Customer ${orderData.customerId}`
                    let customerPhone = 'Phone not available'
                    
                    try {
                        const customerResponse = await fetch(`http://localhost:8084/api/users/${orderData.customerId}`)
                        if (customerResponse.ok) {
                            const customerData = await customerResponse.json()
                            customerName = customerData.userProfile ? 
                                `${customerData.userProfile.firstName} ${customerData.userProfile.lastName}` : 
                                customerData.username
                            customerPhone = customerData.userProfile?.phone || 'Phone not available'
                        }
                    } catch (customerError) {
                        console.warn(`Could not fetch customer ${orderData.customerId}:`, customerError)
                    }
                    
                    return {
                        id: delivery.id,
                        orderId: `ORD-${orderData.id.toString().padStart(3, '0')}`,
                        restaurant: `Restaurant ${orderData.restaurantId}`, 
                        customerName,
                        customerPhone,
                        deliveryAddress: orderData.deliveryAddress || "Address not specified",
                        items: orderData.items || [],
                        totalAmount: orderData.totalAmount || 0,
                        status: delivery.logisticsStatus || orderData.status, // Use logistics status if available
                        estimatedDelivery: getDeliveryETA(delivery.logisticsStatus || orderData.status),
                        createdAt: orderData.createdAt,
                        riderId: delivery.riderId,
                        pickupTime: delivery.pickupTime,
                        deliveryTime: delivery.deliveryTime
                    }
                })
            )
            
            // Filter out any null results from failed order fetches
            const validDeliveries = transformedDeliveries.filter(delivery => delivery !== null)
            
            console.log(`[RiderHome] Loaded ${validDeliveries.length} active deliveries from database`)
            setActiveDeliveries(validDeliveries)
            
        } catch (error) {
            console.error('[RiderHome] Failed to load active deliveries:', error)
            setActiveDeliveries([])
        }
    }

    // Load available orders with READY_FOR_PICKUP status
    const loadAvailableOrders = async () => {
        if (!currentUser?.id) return
        
        try {
            console.log('[RiderHome] Polling for READY_FOR_PICKUP orders...')
            
            // Get orders with READY_FOR_PICKUP status via user-service proxy
            const readyOrders = await orderApi.getOrdersByStatus('READY_FOR_PICKUP')
            console.log('[RiderHome] Found READY_FOR_PICKUP orders:', readyOrders)
            
            setAvailableOrders(readyOrders || [])
            
        } catch (error) {
            console.error('[RiderHome] Failed to load available orders:', error)
            setAvailableOrders([])
        }
    }

    // Handle rider accepting an order
    const handleAcceptOrder = async (orderId) => {
        try {
            console.log(`[RiderHome] Rider ${currentUser.id} accepting order ${orderId}`)
            
            // Update order status to OUT_FOR_DELIVERY and assign rider
            const updatedOrder = await orderApi.assignRiderToOrder(orderId, currentUser.id)
            
            if (updatedOrder) {
                console.log('[RiderHome] Order accepted successfully:', updatedOrder)
                // Refresh both lists
                await loadAvailableOrders()
                await loadActiveDeliveries()
            } else {
                console.error('[RiderHome] Failed to accept order')
            }
        } catch (error) {
            console.error('[RiderHome] Error accepting order:', error)
        }
    }

    // Handle rider rejecting an order
    const handleRejectOrder = async (orderId) => {
        try {
            console.log(`[RiderHome] Rider ${currentUser.id} rejecting order ${orderId}`)
            
            // Remove order from available list (just local state, order stays READY_FOR_PICKUP for other riders)
            setAvailableOrders(prev => prev.filter(order => order.id !== orderId))
            
        } catch (error) {
            console.error('[RiderHome] Error rejecting order:', error)
        }
    }

    // Handle rider marking order as delivered
    const handleMarkDelivered = async (orderId) => {
        try {
            console.log(`[RiderHome] Rider ${currentUser.id} marking order ${orderId} as delivered`)
            
            // Update order status to DELIVERED
            const deliveredOrder = await orderApi.markAsDelivered(orderId)
            
            if (deliveredOrder) {
                console.log('[RiderHome] Order marked as delivered successfully:', deliveredOrder)
                // Refresh active deliveries list
                await loadActiveDeliveries()
            } else {
                console.error('[RiderHome] Failed to mark order as delivered')
            }
        } catch (error) {
            console.error('[RiderHome] Error marking order as delivered:', error)
        }
    }
    
    // Get delivery ETA based on exact database logistics status
    const getDeliveryETA = (status) => {
        const etaMap = {
            'ASSIGNED': 'Assigned to you',
            'PICKED_UP': 'On the way', 
            'OUT_FOR_DELIVERY': 'Out for delivery',
            'DELIVERED': 'Delivered',
            'READY_FOR_PICKUP': 'Ready for pickup',
            'CANCELLED': 'Cancelled'
        }
        return etaMap[status] || 'Unknown'
    }

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order)
        setShowOrderModal(true)
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
                    {/* Header */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Rider Dashboard</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Welcome, {currentUser?.username || 'Rider'}!
                                </span>
                                <Button 
                                    onClick={() => setIsOnline(!isOnline)}
                                    className={`${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                                >
                                    {isOnline ? 'Online' : 'Offline'}
                                </Button>
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold">
                                        {currentUser?.username?.charAt(0).toUpperCase() || 'R'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>Current Location: City Center</span>
                        </div>
                    </div>

                    {/* Today's Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Deliveries</p>
                                        <p className="text-2xl font-bold">0</p>
                                    </div>
                                    <Navigation className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Earnings</p>
                                        <p className="text-2xl font-bold">$0.00</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Distance</p>
                                        <p className="text-2xl font-bold">0 km</p>
                                    </div>
                                    <MapPin className="w-8 h-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Rating</p>
                                        <p className="text-2xl font-bold">-</p>
                                    </div>
                                    <div className="text-yellow-500 text-2xl">★</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Available Orders (READY_FOR_PICKUP) */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Available Orders - Ready for Pickup</h2>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Polling every 15s</span>
                            </div>
                        </div>
                        
                        {!isOnline ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Go online to see available orders</p>
                                <p className="text-sm">Click the "Online" button above</p>
                            </div>
                        ) : availableOrders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No orders ready for pickup</p>
                                <p className="text-sm">New orders will appear here automatically</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableOrders.map((order) => (
                                    <Card key={order.id} className="border-l-4 border-l-orange-500">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold">Order #{order.id}</h3>
                                                        <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                            READY FOR PICKUP
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Ready now</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>Restaurant pickup</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Navigation className="w-4 h-4" />
                                                            <span>{order.deliveryAddress || 'Address provided'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-green-600 hover:bg-green-700 flex-1"
                                                            onClick={() => handleAcceptOrder(order.id)}
                                                        >
                                                            Accept Delivery
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                                            onClick={() => handleRejectOrder(order.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Deliveries */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Active Deliveries</h2>
                            <Button variant="ghost" className="text-yellow-600">Refresh</Button>
                        </div>
                        
                        {activeDeliveries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No active deliveries</p>
                                <p className="text-sm">Turn online to receive delivery requests</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeDeliveries.map((delivery) => (
                                    <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-bold text-gray-700">{delivery.restaurant.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{delivery.restaurant}</h3>
                                                            <p className="text-sm text-gray-600">Order #{delivery.orderId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{delivery.customerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>ETA: {delivery.estimatedDelivery}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span>${delivery.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleViewOrderDetails(delivery)}
                                                    >
                                                        View Details
                                                    </Button>
                                                    {delivery.status === 'OUT_FOR_DELIVERY' && (
                                                        <Button 
                                                            variant="default" 
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleMarkDelivered(delivery.id)}
                                                        >
                                                            Mark as Delivered
                                                        </Button>
                                                    )}
                                                </div>
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
          
            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Order Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowOrderModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Restaurant</h4>
                                <p className="text-gray-600">{selectedOrder.restaurant}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Customer Information</h4>
                                <p className="text-gray-600">{selectedOrder.customerName}</p>
                                <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                                <p className="text-gray-600">{selectedOrder.deliveryAddress}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                                    <span>Total</span>
                                    <span>${selectedOrder.totalAmount}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Delivery Status</h4>
                                <p className="text-gray-600 capitalize">{selectedOrder.status.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500">Estimated delivery: {selectedOrder.estimatedDelivery}</p>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                                    Mark as Delivered
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Contact Customer
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}