import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Clock, CheckCircle, Eye, User, MapPin, DollarSign, Navigation, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import orderApi from '@/services/order'

export default function RiderOrderHistory() {
  const navigate = useNavigate()
  const { getCurrentUser } = useAuth()
  const currentUser = getCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load rider orders on component mount
  useEffect(() => {
    if (currentUser) {
      loadRiderOrders()
    }
  }, [currentUser])

  // Auto-refresh orders every 10 seconds to catch new assignments
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        console.log('[RiderOrderHistory] Auto-refreshing delivery assignments...')
        loadRiderOrders()
      }, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const loadRiderOrders = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)
    
    try {
      console.log('[RiderOrderHistory] Loading delivery assignments for rider:', currentUser.id)
      
      // Fetch orders with different statuses that riders need to handle
      const statusesToFetch = ['READY_FOR_PICKUP', 'ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY']
      const allDeliveryOrders = []
      
      for (const status of statusesToFetch) {
        try {
          const orders = await orderApi.getOrdersByStatus(status)
          allDeliveryOrders.push(...orders)
        } catch (error) {
          console.error(`[RiderOrderHistory] Failed to fetch ${status} orders:`, error)
        }
      }
      
      console.log('[RiderOrderHistory] Delivery assignments:', allDeliveryOrders.length, 'orders')
      setOrders(allDeliveryOrders)
    } catch (error) {
      console.error('[RiderOrderHistory] Failed to load delivery assignments:', error)
      setError('Failed to load delivery assignments. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP': return 'bg-green-100 text-green-800'
      case 'ASSIGNED_TO_RIDER': return 'bg-purple-100 text-purple-800'
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800'
      case 'DELIVERED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const viewOrderSummary = (order) => {
    // Navigate to order summary with order details
    const params = new URLSearchParams({
      orderId: order.id,
      restaurantId: order.restaurantId,
      total: order.totalAmount || order.total || 0,
      customerName: order.customerName || `Customer ${order.customerId}`,
      status: order.status,
      mode: 'delivery' // Delivery mode for riders
    })
    navigate(`/order-summary?${params.toString()}`)
  }

  const handlePickupOrder = async (orderId) => {
    try {
      console.log('[RiderOrderHistory] Picking up order:', orderId)
      // In a real implementation, this would update via logistics-service
      // For now, we'll simulate the status update
      alert('Order picked up! Status updated to Out for Delivery')
      await loadRiderOrders()
    } catch (error) {
      console.error('[RiderOrderHistory] Failed to pickup order:', error)
      alert('Failed to update pickup status. Please try again.')
    }
  }

  const handleDeliverOrder = async (orderId) => {
    try {
      console.log('[RiderOrderHistory] Delivering order:', orderId)
      // In a real implementation, this would update via logistics-service
      alert('Order delivered successfully!')
      await loadRiderOrders()
    } catch (error) {
      console.error('[RiderOrderHistory] Failed to deliver order:', error)
      alert('Failed to update delivery status. Please try again.')
    }
  }

  if (!currentUser || currentUser.role !== 'RIDER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access denied. Rider access required.</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery assignments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadRiderOrders}>Retry</Button>
        </div>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Delivery Assignments</h1>
                <p className="text-gray-600">Manage your pickup and delivery tasks</p>
              </div>
              <Button 
                variant="outline" 
                onClick={loadRiderOrders}
                className="text-sm"
              >
                Refresh Assignments
              </Button>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Delivery #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {order.orderTime ? order.orderTime.toLocaleString() : 
                         order.createdAt ? new Date(order.createdAt).toLocaleString() : 
                         'Date unavailable'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Restaurant & Customer Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Pickup from Restaurant</p>
                        <p className="text-blue-600">Restaurant ID: {order.restaurantId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <User className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Deliver to Customer</p>
                        <p className="text-green-600">Customer ID: {order.customerId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mb-4 p-3 bg-orange-50 rounded">
                      <div className="flex items-center gap-2 text-orange-800 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Delivery Address:</span>
                      </div>
                      <p className="text-orange-700 text-sm">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Order Items Summary */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Items ({order.items?.length || 0}):</h4>
                    <div className="space-y-1">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.menuItemName || item.name}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4 pt-2 border-t">
                    <span className="font-semibold">Order Value:</span>
                    <span className="font-semibold text-lg">${(order.totalAmount || order.total || 0).toFixed(2)}</span>
                  </div>

                  {/* Status-specific Actions */}
                  {order.status === 'READY_FOR_PICKUP' && (
                    <div className="mb-4">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handlePickupOrder(order.id)}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Pickup Order
                      </Button>
                    </div>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <div className="mb-4">
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleDeliverOrder(order.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Delivered
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => viewOrderSummary(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/rider-messaging', { 
                        state: { 
                          orderId: order.id,
                          customerId: order.customerId,
                          restaurantId: order.restaurantId,
                          orderContext: true
                        }
                      })}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Message Customer
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/rider-messaging', { 
                        state: { 
                          orderId: order.id,
                          customerId: order.customerId,
                          restaurantId: order.restaurantId,
                          orderContext: true
                        }
                      })}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Message Restaurant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery assignments</h3>
              <p className="text-gray-600">New delivery assignments will appear here when orders are ready for pickup</p>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  )
}