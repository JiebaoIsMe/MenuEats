// Restaurant and Menu Service API
const restaurantApi = {
  baseUrl: 'http://localhost:8081/api',

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Restaurant API error for ${endpoint}:`, error);
      throw new Error(`Failed to connect to restaurant service on port 8081: ${error.message}`);
    }
  },

  // Get all restaurants
  async getAllRestaurants() {
    return await this.request('/restaurants');
  },

  // Get restaurant by ID
  async getRestaurantById(id) {
    return await this.request(`/restaurants/${id}`);
  },

  // Get menu items by restaurant name
  async getMenuByRestaurantName(restaurantName) {
    return await this.request(`/restaurant/${encodeURIComponent(restaurantName)}/menu`);
  },

  // Get specific menu item by ID
  async getMenuItemById(itemId) {
    return await this.request(`/menu/${itemId}`);
  }
};

export default restaurantApi;