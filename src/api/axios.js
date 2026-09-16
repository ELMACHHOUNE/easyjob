import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('easyjob_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('easyjob_refresh_token')
      
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', { refreshToken })
          localStorage.setItem('easyjob_access_token', data.accessToken)
          localStorage.setItem('easyjob_refresh_token', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('easyjob_access_token')
          localStorage.removeItem('easyjob_refresh_token')
          localStorage.removeItem('easyjob_user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    const message = error.response?.data?.error || error.message || 'Erreur réseau'
    return Promise.reject(new Error(message))
  }
)

export default api
