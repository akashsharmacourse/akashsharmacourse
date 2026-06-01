import express from 'express'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { sendWelcomeEmail, sendOneOnOneConfirmationEmail } from '../utils/sendEmail.js'

const router = express.Router()

router.post('/send-welcome', adminMiddleware, async (req, res) => {
  try {
    const { to, name, email, password, loginUrl } = req.body
    await sendWelcomeEmail({ to, name, email, password, loginUrl })
    res.json({ success: true, message: 'Welcome email sent successfully' })
  } catch (err) {
    console.error('Send welcome email error:', err)
    res.status(500).json({ error: 'Failed to send welcome email' })
  }
})

export default router
