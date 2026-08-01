import express from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { db } from '../config/firebase.js'
import { Resend } from 'resend'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

router.get('/usage', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret']
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // ── Cloudinary ──
    const cloudinaryUsage = await cloudinary.api.usage()

    // ── Firebase ──
    const usersSnap = await db.collection('users').get()
    const users = usersSnap.docs.map(d => d.data())
    const activeUsers = users.filter(u => u.hasAccess !== false).length
    const expiredUsers = users.filter(u => {
      if (!u.accessExpiresAt) return false
      return new Date(u.accessExpiresAt) < new Date()
    }).length
    const totalRevenue = users.reduce((sum, u) => sum + (u.paymentAmount || 0), 0)

    const coursesSnap = await db.collection('courses').get()
    const publishedCourses = coursesSnap.docs.filter(d => d.data().published).length

    // ── Resend ──
    let resendStats = null
    try {
      const emails = await resend.emails.list()
      resendStats = {
        total: emails?.data?.length || 0,
      }
    } catch {
      resendStats = { total: 'N/A' }
    }

    res.json({
      success: true,
      cloudinary: {
        credits: {
          used: cloudinaryUsage.credits?.usage || 0,
          limit: cloudinaryUsage.credits?.limit || 25,
          percent: parseFloat(cloudinaryUsage.credits?.used_percent || 0).toFixed(1),
        },
        storage: {
          used: (cloudinaryUsage.storage?.usage / 1024 / 1024 / 1024).toFixed(3),
          limit: 25,
        },
        bandwidth: {
          used: (cloudinaryUsage.bandwidth?.usage / 1024 / 1024 / 1024).toFixed(3),
          limit: 25,
        },
        transformations: {
          used: cloudinaryUsage.transformations?.usage || 0,
          limit: cloudinaryUsage.transformations?.limit || 25000,
        },
      },
      firebase: {
        totalStudents: users.length,
        activeStudents: activeUsers,
        expiredStudents: expiredUsers,
        totalRevenue,
        publishedCourses,
      },
      resend: resendStats,
      render: {
        note: 'Check manually at render.com/dashboard',
        url: 'https://dashboard.render.com/billing',
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
