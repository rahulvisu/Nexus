import mongoose from 'mongoose'

const moveSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    san: String,
    fen: String,
    time: { type: Date, default: Date.now },
  },
  { _id: false }
)

const gameSchema = new mongoose.Schema(
  {
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    status: { type: String, enum: ['live', 'finished', 'aborted'], default: 'live' },
    result: { type: String, enum: ['1-0', '0-1', '1/2-1/2', 'ongoing'], default: 'ongoing' },
    moves: [moveSchema],
    chatCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Game = mongoose.model('Game', gameSchema)
