import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: () => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
      },
    },
    type: {
      type: String,
      enum: {
        values: ['full', 'half'],
        message: '{VALUE} is not a valid leave type. Allowed values: full, half',
      },
      required: [true, 'Leave type is required (full or half)'],
    },
    reason: {
      type: String,
      default: '',
      trim: true,
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

export const Leave = mongoose.model('Leave', leaveSchema)
