import mongoose from 'mongoose'

export const TASK_STATUSES = ['active', 'review', 'revisions', 'completed']

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'design',
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'review', 'revisions', 'completed'],
        message: '{VALUE} is not a valid status. Allowed values: active, review, revisions, completed',
      },
      default: 'active',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Automatically manage completedAt timestamp when status changes
taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      if (!this.completedAt) {
        this.completedAt = new Date()
      }
    } else {
      this.completedAt = null
    }
  }
})

export const Task = mongoose.model('Task', taskSchema)
