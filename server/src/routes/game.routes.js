import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import {
  getLiveGames,
  getUserHistory,
  createGame,
  getBestMoveAI,
  createAIGame,
  recordMove,
  finishGame,
} from '../controllers/game.controller.js'

const router = Router()

router.get('/live', getLiveGames)
router.get('/history', auth(true), getUserHistory)
router.post('/', auth(true), createGame)
router.post('/ai', auth(true), createAIGame)
router.post('/:id/move', auth(true), recordMove)
router.post('/:id/finish', auth(true), finishGame)
router.post('/ai/bestmove', getBestMoveAI)

export default router

