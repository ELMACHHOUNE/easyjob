import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { setSocketIO } from './NotificationService.js'

let io = null

export function getIO() {
  return io
}

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'https://easyjob.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  setSocketIO(io)

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token
      if (!token) {
        return next(new Error('Authentification requise'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return next(new Error('Utilisateur non trouvé'))
      }

      socket.userId = user._id.toString()
      socket.userRole = user.role
      socket.user = user
      next()
    } catch (err) {
      return next(new Error('Token invalide'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connecté: ${socket.userId} (${socket.userRole})`)

    socket.join(`user:${socket.userId}`)
    socket.join(`role:${socket.userRole}`)

    socket.on('join_user', (userId) => {
      if (userId === socket.userId) {
        socket.join(`user:${userId}`)
      }
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté: ${socket.userId}`)
    })
  })

  console.log('🚀 Socket.IO configuré')
  return io
}
