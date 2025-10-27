import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Clock, CheckCircle, Eye, User, MapPin, DollarSign, XCircle, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import orderApi from '@/services/order'

export default function BusinessOwnerOrderHistory() {
  const navigate = useNavigate()
  const { getCurrentUser } = useAuth()
  const currentUser = getCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load business owner orders on component mount
  useEffect(() => {
    if (currentUser) {
      loadBusinessOwnerOrders()
    }
  }, [currentUser])

  // Auto-refresh orders every 10 seconds to catch new orders
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        console.log('[BusinessOwnerOrderHistory] Auto-refreshing orders...')
        loadBusinessOwnerOrders()
      }, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const loadBusinessOwnerOrders = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)
    
    try {
      console.log('[BusinessOwnerOrderHistory] Loading all orders for business owner:', currentUser.id)
      // Use the new simplified endpoint that fetches all orders for owner's restaurants
      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const businessOwnerOrders = await response.json()
      console.log('[BusinessOwnerOrderHistory] Business owner orders:', businessOwnerOrders.length, 'orders')
      setOrders(businessOwnerOrders)
    } catch (error) {
      console.error('[BusinessOwnerOrderHistory] Failed to load business owner orders:', error)
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
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
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
      mode: 'manage' // Management mode for business owners
    })
    navigate(`/order-summary?${params.toString()}`)
  }

  const handleAcceptOrder = async (orderId) => {
    try {
      console.log('[BusinessOwnerOrderHistory] Accepting order:', orderId)
      // Use orderApi to connect to ordering service accept endpoint
      await orderApi.acceptOrder(orderId)
      console.log('[BusinessOwnerOrderHistory] Order accepted successfully')
      
      // Refresh the order list to show updated status
      await loadBusinessOwnerOrders()
      
      alert('Order accepted successfully!')
    } catch (error) {
      console.error('[BusinessOwnerOrderHistory] Failed to accept order:', error)
      alert('Failed to accept order. Please try again.')
    }
  }

  const handleRejectOrder = async (orderId) => {
    if (!confirm('Are you sure you want to reject this order?')) {
      return
    }

    try {
      console.log('[BusinessOwnerOrderHistory] Rejecting order:', orderId)
      // Use orderApi to connect to ordering service reject endpoint
      await orderApi.rejectOrder(orderId)
      console.log('[BusinessOwnerOrderHistory] Order rejected successfully')
      
      // Refresh the order list to show updated status
      await loadBusinessOwnerOrders()
      
      alert('Order rejected successfully!')
    } catch (error) {
      console.error('[BusinessOwnerOrderHistory] Failed to reject order:', error)
      alert('Failed to reject order. Please try again.')
    }
  }

  const handleFindRider = async (orderId) => {
    if (!confirm('Mark this order as ready for pickup and find a rider?')) {
      return
    }

    try {
      console.log('[BusinessOwnerOrderHistory] Marking order ready for pickup:', orderId)
      
      // Update order status to READY_FOR_PICKUP
      const response = await fetch(`http://localhost:8084/api/users/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READY_FOR_PICKUP' })
      })
      
      if (response.ok) {
        console.log('[BusinessOwnerOrderHistory] Order marked as ready for pickup')
        // Refresh the order list to show updated status
        await loadBusinessOwnerOrders()
        alert('Order is now ready for pickup! Riders will be notified.')
      } else {
        console.error('[BusinessOwnerOrderHistory] Failed to update order status')
        alert('Failed to update order status. Please try again.')
      }
    } catch (error) {
      console.error('[BusinessOwnerOrderHistory] Error updating order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  if (!currentUser || currentUser.role !== 'BUSINESS_OWNER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access denied. Business owner access required.</p>
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
          <p className="text-gray-600">Loading restaurant orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadBusinessOwnerOrders}>Retry</Button>
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
                <p className="text-gray-600">Manage and track all your restaurant orders</p>
              </div>
              <Button 
                variant="outline" 
                onClick={loadBusinessOwnerOrders}
                className="text-sm"
              >
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

                  {/* Customer Info */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">
                        {order.customerName || `Customer ${order.customerId}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer ID: {order.customerId}
                      </p>
                    </div>
                  </div>


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

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Delivery Address:</span>
                      </div>
                      <p className="text-blue-700 mt-1">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Status Info */}
                  {order.status === 'PREPARING' && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      <Clock className="w-4 h-4" />
                      <span>Order is being prepared</span>
                    </div>
                  )}

                  {order.status === 'READY_FOR_PICKUP' && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded text-sm text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for pickup</span>
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
                    
                    {/* Accept/Reject Actions for NEW orders */}
                    {console.log('[BusinessOwnerOrderHistory] Order status for order', order.id, ':', order.status, 'NEW check:', order.status === 'NEW')}
                    {(order.status === 'NEW' ) && ( 
                      <>
                        <Button 
                          size="sm" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept Order
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject Order
                        </Button>
                      </>
                     )}
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/business-messaging', { 
                        state: { 
                          orderId: order.id,
                          customerId: order.customerId,
                          restaurantId: order.restaurantId,
                          orderContext: true
                        }
                      })}
                    >
                      Message Customer
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate('/business-messaging', { 
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
                    
                    {/* Find Rider button for PREPARING and READY_FOR_PICKUP orders */}
                    {(order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP') && (
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleFindRider(order.id)}
                      >
                        {order.status === 'PREPARING' ? '⏳ Finding Rider...' : '🚗 Rider Available'}
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
              <p className="text-gray-600">Orders from customers will appear here when they place orders at your restaurant</p>
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  )
}
