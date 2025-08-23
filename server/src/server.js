import dotenv from 'dotenv'

dotenv.config()
import http from 'http'
import app from './app.js'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import { initSockets } from './sockets/index.js'


const port = process.env.PORT || 5000

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  },
})

initSockets(io)

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('DB connection failed:', err)
    process.exit(1)
  })
