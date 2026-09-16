import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('easyjob_access_token')
      const savedUser = localStorage.getItem('easyjob_user')
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          // Verify token is still valid
          const { data } = await api.get('/auth/me')
          setUser(data.user)
          localStorage.setItem('easyjob_user', JSON.stringify(data.user))
        } catch (error) {
          console.error('Session expirée:', error)
          localStorage.removeItem('easyjob_access_token')
          localStorage.removeItem('easyjob_refresh_token')
          localStorage.removeItem('easyjob_user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('easyjob_access_token', data.accessToken)
      localStorage.setItem('easyjob_refresh_token', data.refreshToken)
      localStorage.setItem('easyjob_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      localStorage.setItem('easyjob_access_token', data.accessToken)
      localStorage.setItem('easyjob_refresh_token', data.refreshToken)
      localStorage.setItem('easyjob_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true, user: data.user, emailSent: data.emailSent, previewUrl: data.previewUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const verifyEmail = useCallback(async (email, code) => {
    try {
      const { data } = await api.post('/auth/verify-email', { email, code })
      // Update user verification status
      setUser(prev => {
        const updated = { ...prev, isEmailVerified: true }
        localStorage.setItem('easyjob_user', JSON.stringify(updated))
        return updated
      })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const resendVerification = useCallback(async (email) => {
    try {
      const { data } = await api.post('/auth/resend-verification', { email })
      return { success: true, message: data.message, previewUrl: data.previewUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore error on logout
    } finally {
      localStorage.removeItem('easyjob_access_token')
      localStorage.removeItem('easyjob_refresh_token')
      localStorage.removeItem('easyjob_user')
      setUser(null)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    try {
      const { data } = await api.put('/profile', updates)
      const updatedUser = data.user
      setUser(updatedUser)
      localStorage.setItem('easyjob_user', JSON.stringify(updatedUser))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      return { success: true, user: updatedUser, profile: data.profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [queryClient])

  const forgotPassword = useCallback(async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, verifyEmail, resendVerification,
      updateProfile, forgotPassword, resetPassword,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
