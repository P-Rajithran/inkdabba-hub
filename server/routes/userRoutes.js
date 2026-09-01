import express from 'express'
import { User } from '../models/User.js'

const router = express.Router()

// GET /api/users - Retrieve all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).sort({ name: 1 })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users', details: error.message })
  }
})

// POST /api/users - Helper to register a new user
router.post('/', async (req, res) => {
  try {
    const { name, role, email } = req.body

    if (!name || !role || !email) {
      return res.status(400).json({ error: 'Name, role, and email are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    const user = new User({
      name: name.trim(),
      role: role.trim(),
      email: email.toLowerCase().trim(),
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user', details: error.message })
  }
})

export default router
