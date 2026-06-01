import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import paymentRoutes from './routes/payment.js'
import authRoutes from './routes/auth.js'
import sheetsRoutes from './routes/sheets.js'
import emailRoutes from './routes/email.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ONE_ON_ONE_CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ],
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
