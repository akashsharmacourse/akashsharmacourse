import express from 'express'
import { cloudinary } from '../utils/pdfWatermark.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'

const router = express.Router()

// GET upload signature — admin only
// Frontend uses this to upload directly to Cloudinary
router.post('/sign', adminMiddleware, async (req, res) => {
  try {
    const { folder = 'courses', resource_type = 'video' } = req.body
    const timestamp = Math.floor(Date.now() / 1000)

    const paramsToSign = {
      timestamp,
      folder,
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    )

    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resourceType: resource_type,
    })
  } catch (err) {
    console.error('Upload sign error:', err)
    res.status(500).json({ error: 'Failed to generate upload signature' })
  }
})

export default router
