import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import restaurantApi from '@/services/restaurant';

export default function RestaurantMenu({ restaurant, isOpen, onClose, onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});

  useEffect(() => {
    if (isOpen && restaurant) {
      loadMenu();
    }
  }, [isOpen, restaurant]);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[Restaurant Menu] Loading menu for: ${restaurant.name}`);
      const menu = await restaurantApi.getMenuByRestaurantName(restaurant.name);
      console.log(`[Restaurant Menu] Loaded ${menu.length} items`);
      setMenuItems(menu);
    } catch (err) {
      console.error('[Restaurant Menu] Error loading menu:', err);
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = (itemId, quantity) => {
    setCart(prev => {
      if (quantity <= 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: quantity
      };
    });
  };

  const getCartQuantity = (itemId) => {
    return cart[itemId] || 0;
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handleProceedToCheckout = () => {
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(i => i.id === itemId);
      return {
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: quantity,
        price: item.price
      };
    });

    const orderData = {
      restaurant,
      items: orderItems,
      totalAmount: getTotalPrice(),
      totalItems: getTotalItems()
    };

    console.log('[Restaurant Menu] Proceeding to checkout:', orderData);
    onAddToCart(orderData);
    onClose();
  };

  const groupMenuByCategory = () => {
    const grouped = {};
    menuItems.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  if (!restaurant) return null;

  return (
    <>
      {/* Custom Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
        />
      )}
      
      {/* Custom Modal Content */}
      {isOpen && (
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
              <h2 className="text-4xl font-bold">{restaurant.name}</h2>
              <p className="text-lg text-gray-600">{restaurant.location}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-12 overflow-hidden pt-6">
          {/* Left Side - Menu Items */}
          <div className="flex-1 overflow-y-auto pr-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg">Loading menu...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Menu Service Error</h3>
              <p>{error}</p>
              <p className="text-sm mt-1">Please ensure the restaurant service is running on port 8081.</p>
              <Button 
                onClick={loadMenu} 
                className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                Retry Loading Menu
              </Button>
            </div>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No menu items available for this restaurant.</p>
              <p className="text-sm mt-2">The restaurant service may be updating their menu.</p>
            </div>
          )}

          {!loading && !error && menuItems.length > 0 && (
            <div className="space-y-8">
              {Object.entries(groupMenuByCategory()).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4 sticky top-0 bg-white z-10">
                    {category}
                  </h3>
                  <div className="grid gap-6">
                    {items.map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div className="flex-1 mr-6">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-xl">{item.name}</h4>
                                {!item.available && (
                                  <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3 text-lg">{item.description}</p>
                              <p className="text-2xl font-bold text-green-600">${item.price.toFixed(2)}</p>
                            </div>
                            
                            {item.available && (
                              <div className="flex items-center gap-4">
                                {getCartQuantity(item.id) === 0 ? (
                                  <Button 
                                    size="lg" 
                                    onClick={() => updateCartItem(item.id, 1)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 text-lg font-semibold"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add to Cart
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-4">
                                    <Button 
                                      size="lg" 
                                      variant="outline"
                                      onClick={() => updateCartItem(item.id, getCartQuantity(item.id) - 1)}
                                      className="p-3"
                                    >
                                      <Minus className="w-5 h-5" />
                                    </Button>
                                    <span className="w-12 text-center font-bold text-xl">
                                      {getCartQuantity(item.id)}
                                    </span>
                                    <Button 
                                      size="lg" 
                                      variant="outline"
                                      onClick={() => updateCartItem(item.id, getCartQuantity(item.id) + 1)}
                                      className="p-3"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Right Side - Cart Summary */}
          <div className="w-96 flex-shrink-0 border-l pl-12 flex flex-col">
            <div className="sticky top-0 bg-white">
              <h3 className="text-2xl font-semibold mb-6 pb-4 border-b">Order Summary</h3>
              
              {getTotalItems() === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">Your cart is empty</p>
                  <p className="text-lg">Add items to see them here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="max-h-80 overflow-y-auto space-y-4">
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = menuItems.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <div key={itemId} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{item.name}</div>
                            <div className="text-gray-600 text-lg">${item.price.toFixed(2)} × {quantity}</div>
                          </div>
                          <div className="font-bold text-xl">${(item.price * quantity).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-xl">Subtotal:</span>
                      <span className="font-bold text-2xl">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-lg text-gray-600">
                      <span>Items:</span>
                      <span>{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-bold border-t pt-4">
                      <span>Total:</span>
                      <span className="text-green-600">${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 text-xl font-bold"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}