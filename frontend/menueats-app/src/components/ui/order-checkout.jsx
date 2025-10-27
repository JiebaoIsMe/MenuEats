import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Toast from '@/components/ui/toast';
import orderApi from '@/services/order';
import { useAuth } from '@/hooks/useAuth';

export default function OrderCheckout({ orderData, isOpen, onClose, onOrderComplete }) {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, City, State');
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToast = (type, title, message) => {
    console.log('[OrderCheckout] showToast called:', { type, title, message });
    setToast({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateOrder = () => {
    if (!deliveryAddress.trim()) {
      showToast('warning', 'Missing Information', 'Please enter a delivery address');
      return false;
    }

    // Card validation commented out since payment always succeeds
    // if (paymentMethod === 'card') {
    //   if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
    //     showToast('warning', 'Incomplete Card Details', 'Please fill in all card details');
    //     return false;
    //   }
    // }

    return true;
  };

  const processOrder = async () => {
    console.log('[OrderCheckout] processOrder called');
    if (!validateOrder()) return;

    setLoading(true);

    // Prepare order data for backend
    const backendOrderData = {
      customerId: currentUser?.id,
      restaurantId: orderData.restaurant.id,
      deliveryAddress: deliveryAddress.trim(),
      items: orderData.items.map(item => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        price: item.price
      }))
    };

    console.log('[Order Checkout] Sending order data to ordering-service:', backendOrderData);

    try {
      // Create order via user-service proxy (CORS-enabled)
      const createdOrder = await orderApi.createOrder(backendOrderData);
      console.log('[Order Checkout] Order created successfully:', createdOrder);

      // Show success toast immediately
      showToast('success', 'Order Placed Successfully!', `Order #${createdOrder.id} has been confirmed.`);

      setOrderPlaced(true);
      setLoading(false);

      // Re-enable button after 5 seconds
      setTimeout(() => {
        setOrderPlaced(false);
      }, 5000);

      // Delay redirect to show toast
      setTimeout(() => {
        onOrderComplete(createdOrder);
        // Navigate to order history with the new order ID
        navigate(`/order-history?newOrder=${createdOrder.id}`);
      }, 3000);
    } catch (error) {
      console.error('[Order Checkout] Failed to create order:', error);
      showToast('error', 'Order Failed', 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  console.log('[OrderCheckout] Component render - isOpen:', isOpen, 'orderData:', orderData);
  console.log('[OrderCheckout] Toast state:', toast);
  console.log('[OrderCheckout] orderPlaced:', orderPlaced, 'loading:', loading);

  if (!isOpen) {
    console.log('[OrderCheckout] Modal not open, returning null');
    return null;
  }

  return (
    <>
      {/* Custom Modal Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      
      {/* Custom Modal Content */}
      <div
        className="fixed top-1/2 left-1/2 z-50 w-[80vw] max-w-[80vw] h-[85vh] max-h-[85vh] overflow-hidden flex flex-col bg-white rounded-lg border shadow-lg p-6"
        style={{
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '85vh'
        }}
      >
        <div className="flex-shrink-0 border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Checkout</h2>
              <p className="text-lg text-gray-600">Complete your order</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-12 overflow-hidden pt-6">
          {!orderData ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-xl text-gray-600">Loading order details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Left Side - Order Details & Forms */}
              <div className="flex-1 overflow-y-auto pr-6 space-y-8">
                {/* Order Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-4 flex items-center">
                      <Clock className="w-6 h-6 mr-3" />
                      Order Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-lg">Restaurant:</span>
                        <span className="text-lg">{orderData.restaurant.name}</span>
                      </div>
                      <div className="border-t pt-4 space-y-3">
                        {orderData.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <span className="text-lg">{item.quantity}x {item.menuItemName}</span>
                            <span className="font-medium text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
                        <span>Total:</span>
                        <span>${orderData.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-4 flex items-center">
                      <Truck className="w-6 h-6 mr-3" />
                      Delivery Address
                    </h3>
                    <div className="space-y-3">
                      <Label htmlFor="address" className="text-lg font-medium">Address</Label>
                      <Input
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="p-4 text-lg"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-4 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3" />
                      Payment Method
                    </h3>
                    
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
                      <div className="flex items-center space-x-3 py-2">
                        <RadioGroupItem value="card" id="card" className="w-5 h-5" />
                        <Label htmlFor="card" className="text-lg">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-3 py-2">
                        <RadioGroupItem value="cash" id="cash" className="w-5 h-5" />
                        <Label htmlFor="cash" className="text-lg">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'card' && (
                      <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="cardName" className="text-lg font-medium">Cardholder Name</Label>
                            <Input
                              id="cardName"
                              value={cardDetails.name}
                              onChange={(e) => handleCardInputChange('name', e.target.value)}
                              placeholder="John Doe"
                              className="p-4 text-lg mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber" className="text-lg font-medium">Card Number</Label>
                            <Input
                              id="cardNumber"
                              value={cardDetails.number}
                              onChange={(e) => handleCardInputChange('number', formatCardNumber(e.target.value))}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className="p-4 text-lg mt-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="expiry" className="text-lg font-medium">Expiry Date</Label>
                            <Input
                              id="expiry"
                              value={cardDetails.expiry}
                              onChange={(e) => handleCardInputChange('expiry', formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="p-4 text-lg mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-lg font-medium">CVV</Label>
                            <Input
                              id="cvv"
                              value={cardDetails.cvv}
                              onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                              placeholder="123"
                              maxLength={3}
                              className="p-4 text-lg mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Order Summary & Actions */}
              <div className="w-1/3 flex-shrink-0 border-l pl-12 flex flex-col">
                <div className="sticky top-0 bg-white">
                  <h3 className="text-2xl font-semibold mb-6 pb-4 border-b">Order Summary</h3>
                  
                  {/* Order Items */}
                  <div className="mb-8">
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {orderData.items.map((item, index) => (
                        <div key={index} className="flex justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{item.menuItemName}</div>
                            <div className="text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-lg text-blue-900">{orderData.restaurant.name}</h4>
                    <p className="text-blue-700">{orderData.restaurant.location}</p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span>${orderData.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Delivery Fee:</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Service Fee:</span>
                      <span>$1.50</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-xl">
                      <span>Total:</span>
                      <span className="text-green-600">${(orderData.totalAmount + 4.49).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method Display */}
                  <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-lg font-medium">
                        {paymentMethod === 'card' ? 'Pay with card' : 'Cash on delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button 
                    onClick={processOrder}
                    disabled={loading || orderPlaced}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 text-xl font-bold"
                    size="lg"
                  >
                    {orderPlaced ? 'Order Placed ✓' : `Place Order - $${(orderData.totalAmount + 4.49).toFixed(2)}`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        position="top-center"
        duration={5000}
      />
    </>
  );
}