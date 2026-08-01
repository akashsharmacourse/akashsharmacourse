import express from 'express'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const router = express.Router()

router.get('/usage', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret']
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Cloudinary usage
    const usage = await cloudinary.api.usage()

    res.json({
      success: true,
      cloudinary: {
        credits: {
          used: usage.credits?.usage || 0,
          limit: usage.credits?.limit || 25,
          percent: usage.credits?.used_percent || 0,
        },
        storage: {
          used: (usage.storage?.usage / 1024 / 1024 / 1024).toFixed(2), // GB
          limit: 25,
        },
        bandwidth: {
          used: (usage.bandwidth?.usage / 1024 / 1024 / 1024).toFixed(2), // GB
          limit: 25,
        },
        transformations: {
          used: usage.transformations?.usage || 0,
          limit: usage.transformations?.limit || 25000,
        },
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
