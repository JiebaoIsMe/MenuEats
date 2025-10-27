const AUTH_BASE_URL = 'http://localhost:8084/api/auth'

const authApi = {
  async request(endpoint, options = {}) {
    // Add port-specific session isolation header
    const currentPort = window.location.port || '3000'
    const response = await fetch(`${AUTH_BASE_URL}${endpoint}`, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Frontend-Port': currentPort, // Custom header for session isolation
        ...options.headers 
      },
      credentials: 'include', // Important for session management
      ...options
    })
    return response.json()
  },

  get: (endpoint) => authApi.request(endpoint),
  post: (endpoint, data) => authApi.request(endpoint, { method: 'POST', body: JSON.stringify(data) })
}

export const auth = {
  // Login user with username/password
  login: async (username, password) => {
    try {
      console.log('[AUTH SERVICE] Attempting login for:', username)
      const result = await authApi.post('/login', { username, password })
      console.log('[AUTH SERVICE] Login result:', result.success ? 'Success' : 'Failed')
      return result
    } catch (error) {
      console.error('[AUTH SERVICE] Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('[AUTH SERVICE] Attempting registration for:', userData.username)
      const result = await authApi.post('/register', userData)
      console.log('[AUTH SERVICE] Registration result:', result.success ? 'Success' : 'Failed')
      return result
    } catch (error) {
      console.error('[AUTH SERVICE] Registration error:', error)
      return { success: false, message: 'Registration failed' }
    }
  },

  // Logout current user
  logout: async () => {
    try {
      console.log('[AUTH SERVICE] Attempting logout')
      const result = await authApi.post('/logout')
      console.log('[AUTH SERVICE] Logout result:', result.success ? 'Success' : 'Failed')
      return result
    } catch (error) {
      console.error('[AUTH SERVICE] Logout error:', error)
      return { success: false, message: 'Logout failed' }
    }
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const result = await authApi.get('/me')
      if (result.success && result.user) {
        console.log('[AUTH SERVICE] Current user:', result.user.username, '(Role:', result.user.role + ')')
        return result
      } else {
        console.log('[AUTH SERVICE] No authenticated user')
        return { success: false, message: 'Not authenticated' }
      }
    } catch (error) {
      console.error('[AUTH SERVICE] Get current user error:', error)
      return { success: false, message: 'Authentication check failed' }
    }
  },

  // Check authentication status
  checkStatus: async () => {
    try {
      const result = await authApi.get('/status')
      return result
    } catch (error) {
      console.error('[AUTH SERVICE] Status check error:', error)
      return { success: false, message: 'Status check failed' }
    }
  },

  // ====================================================================
  // TODO: REMOVE MOCK FUNCTION - Replace with real authentication
  // ====================================================================
  // Mock function for backward compatibility with port-based detection
  getMockUserFromPort: () => {
    const port = window.location.port
    if (port === '3000') {
      return { id: 2, username: 'customer1', role: 'CUSTOMER' }
    } else if (port === '3001') {
      return { id: 4, username: 'pizzaowner', role: 'BUSINESS_OWNER' }
    } else if (port === '3002') {
      return { id: 1, username: 'rider1', role: 'RIDER' }
    }
    return null
  }
  // ====================================================================
  // END MOCK FUNCTION - Port-based User Detection
  // ====================================================================
}

// Quick test users for development - all use password123
export const testUsers = {
  customer: { username: 'john', password: 'password123' },
  business: { username: 'mario', password: 'password123' },
  rider: { username: 'mike', password: 'password123' }
}