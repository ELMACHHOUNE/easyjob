import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import jobRoutes from './routes/jobs.js'
import applicationRoutes from './routes/applications.js'
import recruiterRoutes from './routes/recruiters.js'
import dashboardRoutes from './routes/dashboard.js'
import notificationRoutes from './routes/notifications.js'
import scrapingRoutes from './routes/scraping.js'
import emailTemplateRoutes from './routes/emailTemplates.js'
import searchProfileRoutes from './routes/searchProfiles.js'
import analyticsRoutes from './routes/analytics.js'
import cvRoutes from './routes/cv.js'
import portfolioRoutes from './routes/portfolio.js'
import recruiterSpaceRoutes from './routes/recruiterSpace.js'
import companyEmailRoutes from './routes/companyEmails.js'
import seedRoutes from './routes/seed.js'

mongoose.set('toJSON', { virtuals: true, versionKey: false })
mongoose.set('toObject', { virtuals: true, versionKey: false })

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Trop de requêtes' } })
app.use('/api/', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/profile/cv', cvRoutes)
app.use('/api/profile/portfolio', portfolioRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/recruiters', recruiterRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/scraping', scrapingRoutes)
app.use('/api/emails', emailTemplateRoutes)
app.use('/api/search-profiles', searchProfileRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/recruiter-space', recruiterSpaceRoutes)
app.use('/api/company-emails', companyEmailRoutes)
app.use('/api/seed', seedRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route non trouvée: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur interne' })
})

async function connectDB() {
  if (mongoose.connection.readyState === 1) return

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGODB_URI non défini')
    throw new Error('MONGODB_URI non défini')
  }

  try {
    await mongoose.connect(uri)
    console.log('✅ MongoDB connecté')
    const { fixJobOfferIndexes } = await import('./services/dbMigration.js')
    await fixJobOfferIndexes()
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    throw err
  }
}

export { connectDB }
export default app
