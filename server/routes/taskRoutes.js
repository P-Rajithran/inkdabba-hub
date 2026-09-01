import express from 'express'
import mongoose from 'mongoose'
import { Task, TASK_STATUSES } from '../models/Task.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Protect all task routes with authMiddleware
router.use(authMiddleware)

/**
 * GET /api/tasks/mine
 * Retrieve tasks where assignee = req.userId
 */
router.get('/mine', async (req, res) => {
  try {
    const filter = { assignee: req.userId }

    // Optional status filter
    if (req.query.status) {
      if (!TASK_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          error: `Invalid status filter '${req.query.status}'. Allowed values: ${TASK_STATUSES.join(', ')}`,
        })
      }
      filter.status = req.query.status
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email role designation')
      .populate('client', 'name industry status')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error('Error fetching user tasks:', error)
    res.status(500).json({ error: 'Failed to fetch your tasks', details: error.message })
  }
})

/**
 * GET /api/tasks
 * Retrieve all tasks across the system.
 * Only allowed if req.userRole === "admin", otherwise returns 403 Forbidden.
 */
router.get('/', async (req, res) => {
  try {
    // Admin check
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Only administrators can view all tasks across all users',
      })
    }

    const filter = {}

    // Optional status filter
    if (req.query.status) {
      if (!TASK_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          error: `Invalid status filter '${req.query.status}'. Allowed values: ${TASK_STATUSES.join(', ')}`,
        })
      }
      filter.status = req.query.status
    }

    // Optional assignee filter
    if (req.query.assignee) {
      if (mongoose.Types.ObjectId.isValid(req.query.assignee)) {
        filter.assignee = req.query.assignee
      } else {
        return res.status(400).json({ error: 'Invalid assignee ID format in query' })
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email role designation')
      .populate('client', 'name industry status')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error('Error fetching all tasks:', error)
    res.status(500).json({ error: 'Failed to fetch all tasks', details: error.message })
  }
})

/**
 * POST /api/tasks
 * Create a task. Assignee defaults to req.userId unless admin specifies another user.
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, category, client, assignee, status, dueDate } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' })
    }

    if (status && !TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status '${status}'. Allowed values: ${TASK_STATUSES.join(', ')}`,
      })
    }

    // Determine assignee: defaults to req.userId unless admin specifies another user
    let assignedUserId = req.userId
    if (req.userRole === 'admin' && assignee) {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({ error: 'Invalid assignee ID format' })
      }
      assignedUserId = assignee
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim().toLowerCase() : 'design',
      client: client && mongoose.Types.ObjectId.isValid(client) ? client : null,
      assignee: assignedUserId,
      status: status || 'active',
      dueDate: dueDate ? new Date(dueDate) : null,
      completedAt: status === 'completed' ? new Date() : null,
      createdAt: new Date(),
    })

    const savedTask = await newTask.save()
    const populated = await savedTask
      .populate('assignee', 'name email role designation')
      .then((t) => t.populate('client', 'name industry status'))

    res.status(201).json(populated)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task', details: error.message })
  }
})

/**
 * PATCH /api/tasks/:id/status
 * Update task status. Only the assignee or an admin can update it.
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' })
    }

    if (!status) {
      return res.status(400).json({
        error: 'Status is required in request body',
        allowedValues: TASK_STATUSES,
      })
    }

    if (!TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status '${status}'. Allowed values: ${TASK_STATUSES.join(', ')}`,
      })
    }

    // Find the task
    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Authorization: only the assignee or an admin can update it
    const isAssignee = task.assignee && task.assignee.toString() === req.userId
    const isAdmin = req.userRole === 'admin'

    if (!isAssignee && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Only the assigned user or an administrator can update this task status',
      })
    }

    task.status = status
    const updatedTask = await task.save()
    const populated = await updatedTask
      .populate('assignee', 'name email role designation')
      .then((t) => t.populate('client', 'name industry status'))

    res.json({
      message: 'Task status updated successfully',
      task: populated,
    })
  } catch (error) {
    console.error('Error updating task status:', error)
    res.status(500).json({ error: 'Failed to update task status', details: error.message })
  }
})

export default router
