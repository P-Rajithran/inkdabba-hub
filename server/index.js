import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import userRoutes from './routes/userRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import { User } from './models/User.js'
import { seedDatabase } from './seed.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Minimal request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
  })
  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'inkdabba-hub-api',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/leave', leaveRoutes)
app.use('/api/clients', clientRoutes)

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found` })
})

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error', details: err.message })
})

// Start server
async function startServer() {
  await connectDB()

  try {
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log('⚡ [Server] Fresh database detected. Auto-seeding initial agency users & tasks...')
      await seedDatabase(false)
    }
  } catch (err) {
    console.warn('[Server] Auto-seed check skipped:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`🚀 [Server] inkdabba-hub API listening on http://localhost:${PORT}`)
  })
}

startServer()

export default app
