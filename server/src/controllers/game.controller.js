import { Game } from '../models/Game.js'
import { getBestMove } from '../services/stockfish.js'

export async function getLiveGames(_req, res) {
  const games = await Game.find({ status: 'live' })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select('players result status createdAt updatedAt')
  res.json({ games })
}

export async function getUserHistory(req, res) {
  const uid = req.user.id
  const games = await Game.find({ players: uid, status: 'finished' })
    .sort({ updatedAt: -1 })
    .limit(50)
  res.json({ games })
}

export async function createGame(req, res) {
  const { opponentId } = req.body
  if (!opponentId) return res.status(400).json({ message: 'opponentId required' })
  const game = await Game.create({ players: [req.user.id, opponentId], status: 'live', moves: [] })
  res.status(201).json({ game })
}

// Create a new AI game for the authenticated user
export async function createAIGame(req, res) {
  try {
    const game = await Game.create({ players: [req.user.id], status: 'live', moves: [] })
    res.status(201).json({ game })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to create AI game' })
  }
}

// Append a move to a game (only participants)
export async function recordMove(req, res) {
  try {
    const { id } = req.params
    const { from, to, san, fen } = req.body || {}
    if (!from || !to || !fen) return res.status(400).json({ message: 'from, to, fen required' })

    const game = await Game.findOne({ _id: id, players: req.user.id })
    if (!game) return res.status(404).json({ message: 'Game not found' })

    game.moves.push({ from, to, san, fen, time: new Date() })
    await game.save()

    res.json({ ok: true, moves: game.moves.length })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to record move' })
  }
}

// Finish a game and set result
export async function finishGame(req, res) {
  try {
    const { id } = req.params
    const { result } = req.body || {}
    const allowed = ['1-0', '0-1', '1/2-1/2']
    if (!allowed.includes(result)) return res.status(400).json({ message: 'Invalid result' })

    const game = await Game.findOne({ _id: id, players: req.user.id })
    if (!game) return res.status(404).json({ message: 'Game not found' })

    game.status = 'finished'
    game.result = result
    await game.save()

    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to finish game' })
  }
}

export async function getBestMoveAI(req, res) {
  try {
    const { fen, depth = 12, skill = 10 } = req.body || {}
    if (!fen) return res.status(400).json({ message: 'fen required' })
    const best = await getBestMove(fen, { depth, skill })
    res.json({ best })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'AI failed' })
  }
}

