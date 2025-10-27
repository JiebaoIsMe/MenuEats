import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Clock, CheckCircle, Eye, User, MapPin, DollarSign, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import orderApi from '@/services/order'

export default function CustomerOrderHistory() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCurrentUser, loading: authLoading, isAuthenticated } = useAuth()
  const currentUser = getCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load customer orders on component mount
  useEffect(() => {
    if (currentUser) {
      loadCustomerOrders()
    }
  }, [currentUser])

  // Auto-refresh orders every 10 seconds to catch new orders
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        console.log('[CustomerOrderHistory] Auto-refreshing orders...')
        loadCustomerOrders()
      }, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const loadCustomerOrders = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)
    
    try {
      console.log('[CustomerOrderHistory] Loading customer orders for user:', {
        id: currentUser.id,
        username: currentUser.username,
        role: currentUser.role
      })
      // Fetch via user-service to avoid CORS issues
      const customerOrders = await orderApi.getCustomerOrders(currentUser.id)
      console.log('[CustomerOrderHistory] Received customer orders:', customerOrders)
      setOrders(customerOrders)
    } catch (error) {
      console.error('[CustomerOrderHistory] Error loading orders:', error)
      setError('Failed to load order history. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800'
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800'
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
      restaurantId: order.restaurantId || currentUser.id,
      total: order.totalAmount || order.total || 0,
      customerName: order.customerName || `Customer ${order.customerId}`,
      status: order.status,
      mode: 'view' // View mode, not confirmation mode
    })
    navigate(`/order-summary?${params.toString()}`)
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      console.log('[CustomerOrderHistory] Cancelling order:', orderId)
      await orderApi.cancelOrder(orderId)
      console.log('[CustomerOrderHistory] Order cancelled successfully')
      
      // Refresh the order list
      await loadCustomerOrders()
      
      alert('Order has been cancelled successfully')
    } catch (error) {
      console.error('[CustomerOrderHistory] Failed to cancel order:', error)
      alert('Failed to cancel order. Please try again.')
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please login to view your order history.</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    )
  }

  // Check user role
  if (currentUser.role !== 'CUSTOMER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access denied. Customer access required.</p>
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
          <p className="text-gray-600">Loading your order history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCustomerOrders}>Retry</Button>
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Order History</h1>
                <p className="text-gray-600">View your past and current orders</p>
              </div>
              <Button 
                onClick={loadCustomerOrders} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Orders
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
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
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

                  {/* Cancel Order Section for eligible orders */}
                  {['NEW', 'CONFIRMED'].includes(order.status) && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel Order
                      </Button>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menuItemName || item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4 pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-lg">${(order.totalAmount || order.total || 0).toFixed(2)}</span>
                  </div>

                  {/* Status Info */}
                  {order.status === 'PREPARING' && order.estimatedTime && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      <Clock className="w-4 h-4" />
                      <span>Est. {order.estimatedTime}</span>
                    </div>
                  )}

                  {order.status === 'READY_FOR_PICKUP' && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded text-sm text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for pickup</span>
                    </div>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && order.estimatedTime && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-orange-50 rounded text-sm text-orange-800">
                      <MapPin className="w-4 h-4" />
                      <span>Out for delivery - Est. {order.estimatedTime}</span>
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
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/customer-messaging', { 
                        state: { 
                          orderId: order.id,
                          customerId: order.customerId,
                          restaurantId: order.restaurantId,
                          orderContext: true
                        }
                      })}
                    >
                      Message Restaurant
                    </Button>
                    
                    {['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) && (
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate('/customer-messaging', { 
                          state: { 
                            orderId: order.id,
                            customerId: order.customerId,
                            restaurantId: order.restaurantId,
                            orderContext: true
                          }
                        })}
                      >
                        Message Rider
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Your order history will appear here after you place your first order</p>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  )
}