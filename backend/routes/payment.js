import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { db, auth } from '../config/firebase.js'
import { appendToSheet, updatePaymentStatus } from '../utils/sheetsHelper.js'
import { sendWelcomeEmail, sendOneOnOneConfirmationEmail } from '../utils/sendEmail.js'

dotenv.config()

const router = express.Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'MOCK_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'MOCK_KEY_SECRET',
})

// ── Create Razorpay Order ─────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', type } = req.body

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { type }, // 'course' or '1on1'
    })

    res.json({ success: true, order })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ success: false, error: 'Failed to create order' })
  }
})

// ── Save Lead (form submit before payment) ────────────
router.post('/save-lead', async (req, res) => {
  try {
    const { name, email, phone, type } = req.body

    const sheetId = type === 'course'
      ? process.env.GOOGLE_SHEET_ID_COURSE
      : process.env.GOOGLE_SHEET_ID_ONEONONE

    const sheetName = type === 'course' ? 'Leads' : '1on1Leads'

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    // Columns: Timestamp | Name | Email | Phone | Type | Status
    await appendToSheet(sheetId, sheetName, [
      timestamp, name, email, phone, type, 'form_filled'
    ])

    res.json({ success: true })
  } catch (err) {
    console.error('Save lead error:', err)
    res.status(500).json({ success: false, error: 'Failed to save lead' })
  }
})

// ── Razorpay Webhook ──────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    // Verify signature
    const signature = req.headers['x-razorpay-signature']
    const body = req.body // raw buffer

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const event = JSON.parse(body.toString())

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const { name, email, phone, type } = payment.notes || {}

      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      const amount = payment.amount / 100

      // ── COURSE FLOW ──────────────────────────
      if (type === 'course') {
        const sheetId = process.env.GOOGLE_SHEET_ID_COURSE

        // Update lead status to paid
        await updatePaymentStatus(sheetId, 'Leads', email, 'paid')

        // Also append to Enrollments sheet
        await appendToSheet(sheetId, 'Enrollments', [
          timestamp, name, email, phone, `₹${amount}`, 'active'
        ])

        // Generate temp password
        const tempPassword = `Akash@${Math.floor(1000 + Math.random() * 9000)}`

        // Create Firebase user
        let userRecord
        try {
          userRecord = await auth.createUser({
            email,
            password: tempPassword,
            displayName: name,
          })
        } catch (e) {
          // User already exists — reset password
          userRecord = await auth.getUserByEmail(email)
          await auth.updateUser(userRecord.uid, { password: tempPassword })
        }

        // Store in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          name,
          email,
          phone,
          enrolledCourses: [],
          createdAt: new Date().toISOString(),
          paymentAmount: amount,
          paymentId: payment.id,
        }, { merge: true })

        // Send welcome email
        await sendWelcomeEmail({
          to: email,
          name,
          email,
          password: tempPassword,
          loginUrl: `${process.env.CLIENT_URL}/login`,
        })
      }

      // ── 1ON1 FLOW ────────────────────────────
      if (type === '1on1') {
        const sheetId = process.env.GOOGLE_SHEET_ID_ONEONONE

        // Append to 1on1 sheet
        await appendToSheet(sheetId, '1on1Enrollments', [
          timestamp, name, email, phone, `₹${amount}`, 'paid'
        ])

        // Send confirmation + Calendly link
        await sendOneOnOneConfirmationEmail({
          to: email,
          name,
          calendlyLink: process.env.CALENDLY_LINK,
        })
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
