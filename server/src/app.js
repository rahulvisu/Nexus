import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


import authRoutes from './routes/auth.routes.js'
import gameRoutes from './routes/game.routes.js'



const app = express()

app.use(
  cors({
    origin:'*' || process.env.CLIENT_ORIGIN,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Healthcheck
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found', path: req.originalUrl })
})

export default app
