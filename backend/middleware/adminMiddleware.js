export function adminMiddleware(req, res, next) {
  const secret = req.headers['x-admin-secret']
  if (secret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
