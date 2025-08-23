# Checkmate Server (MERN backend)

A standalone Express + MongoDB + JWT + Socket.io server template to pair with your React frontend.

## Quick start

1. cd server
2. cp .env.example .env  # update values
3. npm install
4. npm run dev

The API will run on PORT (default 5000). Configure CLIENT_ORIGIN to your frontend.

## Endpoints
- GET /healthz
- POST /api/auth/register { username, email, password }
- POST /api/auth/login { email, password }
- GET /api/auth/me (Bearer token)
- GET /api/games/live
- GET /api/games/history (Bearer token)
- POST /api/games (Bearer token) { opponentId }
- POST /api/games/ai/bestmove { fen, depth?, skill? }

## Sockets
- lobby:hello { userId?, rating? }
- queue:join { userId, rating }
- queue:left
- match:found { gameId, white, black }
- game:join { gameId }
- move { gameId, move }
- chat:message { gameId, message, user? }

## Notes
- Matchmaking is an in-memory nearest-rating queue; replace with a persistent service for production.
- Stockfish wrapper is minimal; verify it in your environment or swap for a native engine service.
