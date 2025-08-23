import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 1200, min: 100, max: 3500 },
    avatarUrl: { type: String },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
