import { auth } from '../config/firebase.js'

export async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const decoded = await auth.verifyIdToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
