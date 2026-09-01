import express from 'express'
import mongoose from 'mongoose'
import { Leave } from '../models/Leave.js'
import { User } from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/leave/today
 * Returns today's leave entries with populated user details
 */
router.get('/today', async (req, res) => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const leaves = await Leave.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })

    res.json(leaves)
  } catch (error) {
    console.error('Error fetching today leaves:', error)
    res.status(500).json({ error: 'Failed to fetch today leave entries', details: error.message })
  }
})

/**
 * POST /api/leave
 * Create a leave entry. Admin only.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Admin check
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Only administrators can create leave entries',
      })
    }

    const { user, userId, date, type, reason } = req.body
    const targetUserId = user || userId

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    // Check user exists
    const userDoc = await User.findById(targetUserId)
    if (!userDoc) {
      return res.status(404).json({ error: 'Target user not found' })
    }

    if (!type || !['full', 'half'].includes(type)) {
      return res.status(400).json({
        error: `Invalid leave type '${type}'. Allowed values: 'full', 'half'`,
      })
    }

    // Parse date or default to today
    let leaveDate = new Date()
    if (date) {
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) {
        leaveDate = parsed
      }
    }
    // Normalize to start of day
    leaveDate.setHours(0, 0, 0, 0)

    const newLeave = new Leave({
      user: targetUserId,
      date: leaveDate,
      type,
      reason: reason ? reason.trim() : '',
    })

    const savedLeave = await newLeave.save()
    const populated = await savedLeave.populate('user', 'name email role')

    res.status(201).json(populated)
  } catch (error) {
    console.error('Error creating leave entry:', error)
    res.status(500).json({ error: 'Failed to create leave entry', details: error.message })
  }
})

export default router
