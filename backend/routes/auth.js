import express from 'express'
import { auth, db } from '../config/firebase.js'

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

export default router
