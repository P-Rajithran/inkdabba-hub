import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'onboarding', 'paused'],
        message: '{VALUE} is not a valid status. Allowed values: active, onboarding, paused',
      },
      default: 'active',
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

export const Client = mongoose.model('Client', clientSchema)
