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

// ── Verify Payment ────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name, email, phone, type
    } = req.body

    // STEP 1 — Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' })
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    if (type === 'course') {
      
      // STEP 2 — Sheet update (fail hone pe bhi aage badho)
      try {
        const sheetId = process.env.GOOGLE_SHEET_ID_COURSE
        await updatePaymentStatus(sheetId, 'Leads', email, 'paid')
        await appendToSheet(sheetId, 'Enrollments', [
          timestamp, name, email, phone, '₹9,999', 'active'
        ])
        console.log('Sheet updated successfully')
      } catch (sheetErr) {
        console.error('Sheet update failed — continuing:', sheetErr.message)
      }

      // STEP 3 — Generate password
      const tempPassword = `Akash@${Math.floor(1000 + Math.random() * 9000)}`

      // STEP 4 — Firebase user create
      let userRecord
      try {
        userRecord = await auth.createUser({
          email,
          password: tempPassword,
          displayName: name,
        })
        console.log('Firebase user created:', userRecord.uid)
      } catch (e) {
        if (e.code === 'auth/email-already-exists') {
          userRecord = await auth.getUserByEmail(email)
          await auth.updateUser(userRecord.uid, { password: tempPassword })
          console.log('Firebase user updated:', userRecord.uid)
        } else {
          console.error('Firebase user error:', e.message)
          return res.status(500).json({ success: false, error: 'User creation failed' })
        }
      }

      // STEP 5 — Firestore update
      try {
        const courseSnap = await db.collection('courses')
          .where('published', '==', true)
          .limit(1)
          .get()
        const courseId = courseSnap.empty ? '' : courseSnap.docs[0].id

        const accessExpiresAt = new Date()
        accessExpiresAt.setDate(accessExpiresAt.getDate() + 30)

        await db.collection('users').doc(userRecord.uid).set({
          name,
          email,
          phone,
          hasAccess: true,
          enrolledCourseId: courseId,
          completedChapters: [],
          progress: 0,
          watchTimeMinutes: 0,
          createdAt: new Date().toISOString(),
          accessExpiresAt: accessExpiresAt.toISOString(),
          paymentAmount: 9999,
          paymentId: razorpay_payment_id,
        }, { merge: true })
        console.log('Firestore updated successfully')
      } catch (firestoreErr) {
        console.error('Firestore error:', firestoreErr.message)
      }

      // STEP 6 — Send email
      try {
        await sendWelcomeEmail({
          to: email,
          name,
          email,
          password: tempPassword,
          loginUrl: process.env.DASHBOARD_URL || 'http://localhost:5173/login',
        })
        console.log('Welcome email sent to:', email)
      } catch (emailErr) {
        console.error('Email error:', emailErr.message)
      }
    }

    if (type === '1on1') {
      try {
        const sheetId = process.env.GOOGLE_SHEET_ID_ONEONONE
        await appendToSheet(sheetId, '1on1Enrollments', [
          timestamp, name, email, phone, '₹24,999', 'paid'
        ])
      } catch (sheetErr) {
        console.error('1on1 Sheet error:', sheetErr.message)
      }

      try {
        await sendOneOnOneConfirmationEmail({
          to: email,
          name,
          calendlyLink: process.env.CALENDLY_LINK,
        })
      } catch (emailErr) {
        console.error('1on1 Email error:', emailErr.message)
      }
    }

    // Always return success if signature verified
    res.json({ success: true })

  } catch (err) {
    console.error('Verify route error:', err)
    res.status(500).json({ success: false, error: 'Verification failed' })
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
        const courseSnap = await db.collection('courses')
          .where('published', '==', true)
          .limit(1)
          .get()
        const courseId = courseSnap.empty ? '' : courseSnap.docs[0].id

        await db.collection('users').doc(userRecord.uid).set({
          name,
          email,
          phone,
          hasAccess: true,
          enrolledCourseId: courseId,
          completedChapters: [],
          progress: 0,
          watchTimeMinutes: 0,
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
          loginUrl: process.env.DASHBOARD_URL || 'http://localhost:5173/login',
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
