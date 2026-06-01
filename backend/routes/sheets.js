import express from 'express'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { appendToSheet, updatePaymentStatus } from '../utils/sheetsHelper.js'

const router = express.Router()

router.post('/append', adminMiddleware, async (req, res) => {
  try {
    const { sheetId, sheetName, values } = req.body
    await appendToSheet(sheetId, sheetName, values)
    res.json({ success: true, message: 'Row appended successfully' })
  } catch (err) {
    console.error('Append to sheet error:', err)
    res.status(500).json({ error: 'Failed to append to sheet' })
  }
})

export default router
