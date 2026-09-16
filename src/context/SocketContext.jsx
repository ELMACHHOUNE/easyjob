import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [socketError, setSocketError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
        setSocketError(null)
      }
      return
    }

    const token = localStorage.getItem('easyjob_access_token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      setIsConnected(true)
      setSocketError(null)
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('connect_error', (err) => setSocketError(err.message))

    socket.on('notification', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      if (notification?.title) {
        toast(notification.title, {
          icon: '🔔',
          duration: 4000,
        })
      }
    })

    socket.on('unread_count', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setSocketError(null)
    }
  }, [isAuthenticated, user, queryClient])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, socketError }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
