import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { CheckCircle, MessageCircle, Clock, MapPin, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import orderApi from '@/services/order'

export default function OrderSummary() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get order details from URL params
  const orderId = searchParams.get('orderId')
  const restaurantId = searchParams.get('restaurantId')
  const total = searchParams.get('total')

  // Fetch real order data from API
  const fetchOrderData = async () => {
    if (!orderId) {
      setError('Order ID not provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('[Order Summary] Fetching order:', orderId)
      
      const order = await orderApi.getOrderById(orderId)
      
      setOrderData({
        id: order.id,
        restaurant: {
          id: order.restaurantId,
          name: order.restaurantName || 'Restaurant',
          owner: 'Restaurant Owner',
          ownerId: order.restaurantId
        },
        items: order.items || [],
        total: order.totalAmount,
        status: order.status,
        estimatedTime: '25-30 minutes',
        paymentMethod: 'Credit Card',
        deliveryAddress: order.deliveryAddress
      })
      
      console.log('[Order Summary] Order data loaded:', order)
    } catch (err) {
      console.error('[Order Summary] Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  // Determine user based on port and fetch order data
  useEffect(() => {
    const port = window.location.port
    if (port === '3000') {
      setCurrentUser({ id: 2, name: 'customer1', role: 'CUSTOMER' })
    } else if (port === '3001') {
      setCurrentUser({ id: 4, name: 'pizzaowner', role: 'BUSINESS_OWNER' })
    } else {
      setCurrentUser({ id: 1, name: 'user', role: 'UNKNOWN' })
    }
    
    fetchOrderData()
  }, [orderId])

  const initiateOrderConversation = async () => {
    if (!currentUser) return

    try {
      console.log(`[EDA Order] Initiating order-based conversation`)
      console.log(`[EDA Order] Customer ${currentUser.id} → Restaurant Owner ${orderData.restaurant.ownerId}`)
      console.log(`[EDA Order] Order ID: ${orderId}`)
      
      const messageData = {
        receiverId: parseInt(orderData.restaurant.ownerId),
        content: `New order #${orderId} placed`,
        messageType: 'ORDER_INQUIRY',
        orderId: parseInt(orderId)
      }

      const response = await fetch(`http://localhost:8084/api/users/${currentUser.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`[EDA Order] Order conversation initiated successfully:`, {
          messageId: result.id,
          orderId: orderId,
          customerId: currentUser.id,
          restaurantOwnerId: orderData.restaurant.ownerId,
          kafkaEvents: ['MessageSentEvent', 'ConversationStartedEvent'],
          messageType: 'ORDER_INQUIRY'
        })
        
        setConversationStarted(true)
        
        // Navigate to messaging after brief delay
        setTimeout(() => {
          navigate('/messaging')
        }, 2000)
      } else {
        console.error('[EDA Order] Failed to initiate conversation:', response.status)
      }
    } catch (error) {
      console.error('[EDA Order] Error initiating conversation:', error)
    }
  }

  const goToMessaging = () => {
    navigate('/messaging')
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-start p-4">
          <SidebarTrigger />
        </div>
        
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
            <p className="text-lg text-gray-600">Thank you for your order. Payment has been processed successfully.</p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchOrderData} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && orderData && (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                  
                  {/* Order Info */}
                  <div className="flex items-center justify-between mb-6 p-6 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-lg">Order #{orderData.id}</p>
                      <p className="text-gray-600">Status: {orderData.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">${orderData.total.toFixed(2)}</p>
                      <p className="text-gray-600">{orderData.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex items-center gap-4 mb-6 p-6 border rounded-lg">
                    <Store className="w-12 h-12 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-lg">{orderData.restaurant.name}</h3>
                      <p className="text-gray-600">Owner: {orderData.restaurant.owner}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b">
                        <div>
                          <span className="font-medium text-lg">{item.menuItemName}</span>
                          <span className="text-gray-600 ml-2">×{item.quantity}</span>
                        </div>
                        <span className="font-medium text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 font-semibold text-xl">
                      <span>Total</span>
                      <span>${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-800 font-medium">Estimated preparation time: {orderData.estimatedTime}</span>
                  </div>

                  {/* Delivery Address */}
                  {orderData.deliveryAddress && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mt-4">
                      <MapPin className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Delivery Address:</p>
                        <p className="text-green-700">{orderData.deliveryAddress}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Panel */}
            <div className="space-y-6">

            </div>
          </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  )
}