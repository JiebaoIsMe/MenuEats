import { useState, useEffect } from 'react'
import { auth } from '../services/auth'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on hook initialization
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const result = await auth.getCurrentUser()
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('[USE AUTH] Error checking auth status:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const result = await auth.login(username, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
      }
      
      return result
    } catch (error) {
      console.error('[USE AUTH] Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const result = await auth.register(userData)
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
      }
      
      return result
    } catch (error) {
      console.error('[USE AUTH] Registration error:', error)
      return { success: false, message: 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      const result = await auth.logout()
      setUser(null)
      setIsAuthenticated(false)
      return result
    } catch (error) {
      console.error('[USE AUTH] Logout error:', error)
      setUser(null)
      setIsAuthenticated(false)
      return { success: false, message: 'Logout failed' }
    }
  }

  // Get current user (only return if properly authenticated)
  const getCurrentUser = () => {
    // Only return authenticated user from real session - no fallback
    if (isAuthenticated && user) {
      return user
    }
    return null
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    getCurrentUser
  }
}