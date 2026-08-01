import express from 'express'
import { auth, db } from '../config/firebase.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'

const router = express.Router()

// Verify Firebase ID token — used by dashboard
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body
    const decoded = await auth.verifyIdToken(idToken)
    const user = await db.collection('users').doc(decoded.uid).get()

    if (!user.exists) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ success: true, user: { uid: decoded.uid, ...user.data() } })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Delete user from Firebase Auth
router.delete('/user/:uid', adminMiddleware, async (req, res) => {
  try {
    const { uid } = req.params
    await auth.deleteUser(uid)
    console.log('Firebase Auth user deleted:', uid)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Add student manually by admin
router.post('/add-student', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret']
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { name, email, phone, accessDays = 30 } = req.body

    // Generate password
    const tempPassword = `Akash@${Math.floor(1000 + Math.random() * 9000)}`

    // Create Firebase Auth user
    let userRecord
    try {
      userRecord = await auth.createUser({
        email,
        password: tempPassword,
        displayName: name,
      })
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Student already exists' })
      }
      throw e
    }

    // Get published course
    const courseSnap = await db.collection('courses')
      .where('published', '==', true)
      .limit(1)
      .get()
    const courseId = courseSnap.empty ? '' : courseSnap.docs[0].id

    // Access expiry
    const accessExpiresAt = new Date()
    accessExpiresAt.setDate(accessExpiresAt.getDate() + accessDays)

    // Firestore
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
      paymentAmount: 0,
      addedManually: true,
    })

    // Send welcome email
    const { sendWelcomeEmail } = await import('../utils/sendEmail.js')
    await sendWelcomeEmail({
      to: email,
      name,
      email,
      password: tempPassword,
      loginUrl: process.env.DASHBOARD_URL,
    })

    res.json({ success: true, uid: userRecord.uid })
  } catch (err) {
    console.error('Add student error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
