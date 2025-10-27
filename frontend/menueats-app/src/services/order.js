// Order Service API - Direct integration with ordering-service via user-service proxy
const orderApi = {
  baseUrl: 'http://localhost:8084/api/user-orders',

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include session cookies
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Order API error for ${endpoint}:`, error);
      throw new Error(`Failed to connect to ordering service: ${error.message}`);
    }
  },

  // Create a new order via user-service proxy (with CORS support)
  async createOrder(orderData) {
    return await this.request('', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get orders for a specific customer
  async getCustomerOrders(customerId) {
    // Use user-service proxy for customer orders
    return await this.request(`/customer/${customerId}`);
  },

  // Get orders for a specific restaurant (for business owners)
  async getRestaurantOrders(restaurantId) {
    // Use user-service proxy for better CORS handling and authentication
    // Note: This will be called from business owner context where current user owns the restaurant
    const response = await fetch(`http://localhost:8084/api/orders/restaurant/${restaurantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`Failed to get restaurant orders via user-service proxy: HTTP ${response.status}`);
    }

    return await response.json();
  },

  // Get specific order by ID
  async getOrderById(orderId) {
    return await this.request(`/${orderId}`);
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    return await this.request(`/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Cancel order
  async cancelOrder(orderId) {
    return await this.request(`/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Accept order (for restaurant owners)
  async acceptOrder(orderId) {
    const response = await fetch(`http://localhost:8082/api/orders/${orderId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to accept order: HTTP ${response.status}`);
    }

    return await response.json();
  },

  // Reject order (for restaurant owners)
  async rejectOrder(orderId) {
    const response = await fetch(`http://localhost:8082/api/orders/${orderId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to reject order: HTTP ${response.status}`);
    }

    return await response.json();
  },

  // Get orders by status (for riders)
  async getOrdersByStatus(status) {
    return await this.request(`/status/${status}`);
  },

  // Assign rider to order
  async assignRiderToOrder(orderId, riderId) {
    return await this.request(`/${orderId}/assign-rider`, {
      method: 'POST',
      body: JSON.stringify({ riderId }),
    });
  },

  // Mark order as delivered
  async markAsDelivered(orderId) {
    return await this.request(`/${orderId}/mark-delivered`, {
      method: 'POST',
    });
  },

  // Check ordering service health
  async checkHealth() {
    return await this.request('/health/ordering-service');
  }
};

export default orderApi;