import { auth, db } from '../config/firebase.js'

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await auth.verifyIdToken(token)

    // Check admins collection
    const adminDoc = await db.collection('admins').doc(decoded.uid).get()
    if (!adminDoc.exists) {
      return res.status(403).json({ error: 'Forbidden — not an admin' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    console.error('Admin auth error:', err.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export default adminMiddleware
export { adminMiddleware }

