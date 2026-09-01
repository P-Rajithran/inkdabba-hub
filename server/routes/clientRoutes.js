import express from 'express'
import { Client } from '../models/Client.js'

const router = express.Router()

/**
 * GET /api/clients
 * Retrieve all clients
 */
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ name: 1 })
    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message })
  }
})

/**
 * POST /api/clients
 * Register a new client
 */
router.post('/', async (req, res) => {
  try {
    const { name, industry, status } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Client name is required' })
    }

    if (!industry || !industry.trim()) {
      return res.status(400).json({ error: 'Industry is required' })
    }

    const client = new Client({
      name: name.trim(),
      industry: industry.trim(),
      status: status || 'active',
    })

    const saved = await client.save()
    res.status(201).json(saved)
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client', details: error.message })
  }
})

export default router
