import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import paymentRoutes from './routes/payment.js'
import authRoutes from './routes/auth.js'
import sheetsRoutes from './routes/sheets.js'
import emailRoutes from './routes/email.js'
import videoRoutes from './routes/video.js'
import uploadRoutes from './routes/upload.js'
import statsRoutes from './routes/stats.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'https://askakashsharma.in',
  'https://www.askakashsharma.in',
  'https://app.askakashsharma.in',
  'https://admin.askakashsharma.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Raw body for Razorpay webhook signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

// JSON for all other routes
app.use(express.json())

// ── Routes ────────────────────────────────────────────
app.use('/api/payment', paymentRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/sheets', sheetsRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/video', videoRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/stats', statsRoutes)

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
