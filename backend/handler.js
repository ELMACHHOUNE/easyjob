// Env chargé par server.js (dotenv.config sur backend/.env). Sur Vercel,
// les variables sont injectées par la plateforme au runtime.
import app, { connectDB } from './server.js'

let isConnected = false

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB()
    isConnected = true
  }
  return app(req, res)
}
