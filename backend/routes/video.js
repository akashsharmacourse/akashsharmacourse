import express from 'express'
import { db, auth } from '../config/firebase.js'
import { generateSignedVideoUrl, generateSignedPdfUrl } from '../utils/pdfWatermark.js'

const router = express.Router()

// Middleware — verify Firebase token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })
    const decoded = await auth.verifyIdToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// GET signed video URL
router.get('/signed-url/:publicId', verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params
    const uid = req.user.uid

    // Check student access
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return res.status(403).json({ error: 'User not found' })
    }

    const userData = userSnap.data()

    if (!userData.hasAccess) {
      return res.status(403).json({ error: 'No course access' })
    }

    // Generate signed URL with watermark
    const signedUrl = generateSignedVideoUrl(
      decodeURIComponent(publicId),
      userData.name || 'Student',
      userData.email || ''
    )

    console.log('Generated signed URL:', signedUrl)

    res.json({ success: true, url: signedUrl })
  } catch (err) {
    console.error('Signed URL error:', err)
    res.status(500).json({ error: 'Failed to generate URL' })
  }
})

// GET signed PDF URL
router.get('/signed-pdf/:publicId', verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params
    const uid = req.user.uid

    // Check student access
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists || !userSnap.data().hasAccess) {
      return res.status(403).json({ error: 'No access' })
    }

    const signedUrl = generateSignedPdfUrl(decodeURIComponent(publicId))
    console.log('Generated signed PDF URL:', signedUrl)
    res.json({ success: true, url: signedUrl })
  } catch (err) {
    console.error('Signed PDF error:', err)
    res.status(500).json({ error: 'Failed to generate PDF URL' })
  }
})

export default router
