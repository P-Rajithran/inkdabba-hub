import express from 'express'
import { Task } from '../models/Task.js'
import { User } from '../models/User.js'

const router = express.Router()

/**
 * GET /api/leaderboard?range=day|week|month
 * Aggregates completed tasks per user within the specified date range.
 * Returns team members sorted by count descending.
 */
router.get('/', async (req, res) => {
  try {
    const range = (req.query.range || 'week').toLowerCase()

    if (!['day', 'week', 'month'].includes(range)) {
      return res.status(400).json({
        error: `Invalid range '${range}'. Allowed values: day, week, month`,
      })
    }

    const now = new Date()
    const startDate = new Date(now)

    if (range === 'day') {
      // Start of current day (00:00:00)
      startDate.setHours(0, 0, 0, 0)
    } else if (range === 'week') {
      // Past 7 days
      startDate.setDate(startDate.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
    } else if (range === 'month') {
      // Past 30 days
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
    }

    // Aggregate completed tasks by assignee within the date range
    const aggregateResult = await Task.aggregate([
      {
        $match: {
          status: 'completed',
          assignee: { $ne: null },
          $or: [
            { completedAt: { $gte: startDate } },
            // Graceful fallback for legacy records that might have missed completedAt
            { completedAt: null, updatedAt: { $gte: startDate } },
          ],
        },
      },
      {
        $group: {
          _id: '$assignee',
          count: { $sum: 1 },
          recentTasks: { $push: { title: '$title', completedAt: '$completedAt' } },
        },
      },
    ])

    const countMap = new Map()
    for (const item of aggregateResult) {
      countMap.set(item._id.toString(), {
        count: item.count,
        recentTasks: item.recentTasks,
      })
    }

    // Fetch all users to include all team members in leaderboard ranking
    const allUsers = await User.find({}).select('name email role')

    const entries = allUsers.map((user) => {
      const stats = countMap.get(user._id.toString()) || { count: 0, recentTasks: [] }
      return {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        count: stats.count,
        points: stats.count * 10,
        recentTasks: stats.recentTasks ? stats.recentTasks.slice(0, 3) : [],
      }
    })

    // Sort descending by count, then alphabetically by name
    entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    // Assign 1-indexed ranks
    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    res.json({
      range,
      startDate: startDate.toISOString(),
      totalCompleted: aggregateResult.reduce((sum, item) => sum + item.count, 0),
      leaderboard: ranked,
    })
  } catch (error) {
    console.error('Error computing leaderboard:', error)
    res.status(500).json({ error: 'Failed to compute leaderboard', details: error.message })
  }
})

export default router
