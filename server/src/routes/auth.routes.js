import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller.js'
import { auth } from '../middlewares/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth(true), me)

export default router
