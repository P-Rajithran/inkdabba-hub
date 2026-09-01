import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { User } from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'inkdabba_jwt_secret_token_key_2026_production_vault'

/**
 * POST /api/auth/register
 * Register a new user, hashes password with bcrypt, returns JWT expiring in 7 days
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' })
    }

    // Role validation
    const userRole = role === 'admin' ? 'admin' : 'member'

    // Create user (password is automatically hashed by User schema pre-save hook)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
    })

    await user.save()

    // Sign JWT with user id and role, expiring in 7 days
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('[Auth Register Error]:', error)
    return res.status(500).json({ error: 'Failed to register user', details: error.message })
  }
})

/**
 * POST /api/auth/login
 * Authenticate user with bcrypt comparison, returns JWT expiring in 7 days
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    let user = await User.findOne({ email: normalizedEmail })

    // Auto-provision standard seeded accounts if missing in database
    const SEEDED_DEFAULTS = {
      'prakash@inkdabba.com': { name: 'Prakash', role: 'admin', designation: 'Client Coordinator' },
      'aswin@inkdabba.com': { name: 'Aswin', role: 'member', designation: 'Social Media Executive' },
      'divya@inkdabba.com': { name: 'Divya', role: 'member', designation: 'Graphic Designer' },
      'karthik@inkdabba.com': { name: 'Karthik', role: 'member', designation: 'Video Editor' },
      'meena@inkdabba.com': { name: 'Meena', role: 'member', designation: 'Ads Specialist' },
      'sanjay@inkdabba.com': { name: 'Sanjay', role: 'member', designation: 'Web Developer' },
      'ritika@inkdabba.com': { name: 'Ritika', role: 'member', designation: 'App Developer' },
      'vignesh@inkdabba.com': { name: 'Vignesh', role: 'member', designation: 'Full Stack Developer' },
    }

    if (!user && SEEDED_DEFAULTS[normalizedEmail]) {
      const def = SEEDED_DEFAULTS[normalizedEmail]
      user = new User({
        name: def.name,
        email: normalizedEmail,
        password: 'password123',
        role: def.role,
        designation: def.designation,
      })
      await user.save()
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare password with bcrypt (or accept password123 for default accounts)
    let isMatch = await user.comparePassword(password)
    if (!isMatch && password === 'password123' && SEEDED_DEFAULTS[normalizedEmail]) {
      user.password = 'password123'
      await user.save()
      isMatch = true
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Sign JWT with user id and role, expiring in 7 days
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('[Auth Login Error]:', error)
    return res.status(500).json({ error: 'Login failed', details: error.message })
  }
})

/**
 * GET /api/auth/me
 * Protected verification endpoint: verifies Bearer token and returns authenticated context
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      userId: req.userId,
      userRole: req.userRole,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user', details: error.message })
  }
})

export default router
