import dotenv from 'dotenv'
dotenv.config({ path: new URL('../.env', import.meta.url) })

import http from 'http'
import app, { connectDB } from './server.js'
import { setupSocket } from './services/socketManager.js'
import { startNotificationCron } from './services/notificationCron.js'

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()

  const server = http.createServer(app)
  setupSocket(server)

  startNotificationCron()

  server.listen(PORT, () => {
    console.log(`🚀 Serveur EasyJob sur port ${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api`)
    console.log(`🔗 Frontend: http://localhost:5173`)
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('❌ Erreur fatale:', err)
  process.exit(1)
})
