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

export default router
