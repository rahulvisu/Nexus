import { joinQueue, leaveQueue, findMatchFor } from '../services/matchmaking.js'

// Track active players in lobby
const lobbyPlayers = new Map() // userId -> { userId, username, rating, socketId }
const gameRequests = new Map() // requestId -> { id, from, to, timestamp }

export function initSockets(io) {
  io.on('connection', (socket) => {
    // Identify user (optional if anonymous play)
    let userId = socket.handshake.auth?.userId || socket.id
    let username = socket.handshake.auth?.username || `Player${socket.id.slice(-4)}`
    let rating = Number(socket.handshake.auth?.rating || 1200)

    socket.on('lobby:hello', (payload = {}) => {
      if (payload.userId) userId = payload.userId
      if (payload.username) username = payload.username
      if (payload.rating) rating = Number(payload.rating)
      
      socket.join('lobby')
      
      // Add to lobby players
      lobbyPlayers.set(userId, { userId, username, rating, socketId: socket.id })
      
      socket.emit('lobby:welcome', { userId, username, rating })
      
      // Broadcast updated player list to all lobby members
      const activePlayers = Array.from(lobbyPlayers.values())
      console.log('🎯 Broadcasting active players:', activePlayers.map(p => ({ userId: p.userId, username: p.username })))
      io.to('lobby').emit('lobby:players', activePlayers)
    })

    // Game request system
    socket.on('game:request:send', ({ request, targetUserId }) => {
      if (!request || !targetUserId) return
      
      gameRequests.set(request.id, request)
      
      // Find target player's socket
      const targetPlayer = lobbyPlayers.get(targetUserId)
      if (targetPlayer) {
        io.to(targetPlayer.socketId).emit('game:request', request)
      }
    })

    socket.on('game:request:accept', ({ requestId }) => {
      const request = gameRequests.get(requestId)
      if (!request) return
      
      // Create game
      const gameId = `game:${request.from.userId}:${request.to.userId}:${Date.now()}`
      
      // Notify both players
      io.to(request.from.socketId).emit('game:request:accepted', { requestId, gameId })
      io.to(request.to.socketId).emit('game:request:accepted', { requestId, gameId })
      
      // Clean up request
      gameRequests.delete(requestId)
    })

    socket.on('game:request:decline', ({ requestId }) => {
      const request = gameRequests.get(requestId)
      if (!request) return
      
      // Notify requester
      io.to(request.from.socketId).emit('game:request:declined', { 
        requestId, 
        by: request.to.username 
      })
      
      // Clean up request
      gameRequests.delete(requestId)
    })

    socket.on('queue:join', (payload = {}) => {
      if (payload.userId) userId = payload.userId
      if (payload.rating) rating = Number(payload.rating)
      joinQueue({ userId, rating, socketId: socket.id })
      const match = findMatchFor(userId)
      if (match) {
        const gameId = `game:${match.a.userId}:${match.b.userId}:${Date.now()}`
        // notify both
        io.to(match.a.socketId).emit('match:found', { gameId, white: match.a.userId, black: match.b.userId })
        io.to(match.b.socketId).emit('match:found', { gameId, white: match.a.userId, black: match.b.userId })
      } else {
        socket.emit('queue:queued', { userId, rating })
      }
    })

    socket.on('queue:leave', () => {
      leaveQueue(userId)
      socket.emit('queue:left')
    })

    socket.on('game:join', ({ gameId }) => {
      if (!gameId) return
      socket.join(gameId)
      socket.emit('game:joined', { gameId })
    })

    socket.on('move', ({ gameId, move }) => {
      if (!gameId || !move) return
      socket.to(gameId).emit('move', { move })
    })

    socket.on('chat:message', ({ gameId, message, user }) => {
      if (!gameId || !message) return
      
      // Get actual user info from the socket's authenticated user
      const actualUser = {
        id: userId,
        username: user?.username || username
      }
      
      io.to(gameId).emit('chat:message', {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        gameId,
        message: String(message).slice(0, 500),
        user: actualUser,
        at: Date.now(),
      })
    })

    socket.on('disconnect', () => {
      leaveQueue(userId)
      
      // Remove from lobby players
      const wasInLobby = lobbyPlayers.has(userId)
      lobbyPlayers.delete(userId)
      
      console.log('🔌 User disconnected:', { userId, username, wasInLobby })
      
      // Clean up any pending game requests involving this user
      for (const [reqId, request] of gameRequests) {
        if (request.from.userId === userId || request.to.userId === userId) {
          gameRequests.delete(reqId)
        }
      }
      
      // Broadcast updated player list only if user was in lobby
      if (wasInLobby) {
        const activePlayers = Array.from(lobbyPlayers.values())
        console.log('🎯 Broadcasting updated players after disconnect:', activePlayers.map(p => ({ userId: p.userId, username: p.username })))
        io.to('lobby').emit('lobby:players', activePlayers)
      }
    })
  })
}
