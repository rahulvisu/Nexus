
# Checkmate - Full Stack Chess Application

A real-time chess application built with React, Node.js, MongoDB, and Socket.io featuring AI gameplay, user authentication, and live multiplayer matches.

## Project info

**URL**: https://lovable.dev/projects/d38ba5c3-eb26-46fd-ae50-0f88a1fb5386

## Features

- 🤖 **AI Chess**: Play against Stockfish AI (no registration required)
- 👥 **Live Multiplayer**: Real-time matches with rating-based matchmaking
- 💬 **Game Chat**: Live messaging during matches
- 📊 **Game History**: Save and review past games (for registered users)
- 🔐 **User Authentication**: Secure JWT-based auth system
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- Chess.js for game logic
- Socket.io-client for real-time features

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Socket.io for real-time communication
- Stockfish chess engine integration

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- MongoDB Atlas account (or local MongoDB instance)
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexus?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

> **Important**: Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

```bash
# Start the backend server
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate back to root directory (if in server folder)
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new project named "nexus"
3. Create a cluster named "cluster0"
4. Create a database user with read/write permissions
5. Whitelist your IP address in Network Access
6. Copy your connection string to the `.env` file

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Application Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── chess/         # Chess game components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # shadcn/ui components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   └── main.tsx           # Application entry point
├── server/                 # Backend source code
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.io handlers
│   │   └── middlewares/   # Express middlewares
│   └── package.json
└── public/                # Static assets
    └── stockfish/         # Stockfish WASM files
```

## How to Use

### Playing Against AI
1. Visit the application at `http://localhost:5173`
2. Click "Play vs AI" from the header
3. Start playing immediately (no registration required)
4. Your moves are validated and AI responds automatically

### Creating an Account
1. Click "Find an Opponent" (redirects to auth if not logged in)
2. Choose "Sign Up" and create your account
3. Your games will be saved to your profile

### Playing Live Games
1. Register and log in
2. Click "Find an Opponent"
3. Join the matchmaking queue
4. Get matched with players near your rating

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Games
- `GET /api/games/history` - Get user's game history
- `POST /api/games/ai` - Create new AI game
- `POST /api/games/:id/move` - Save a move
- `POST /api/games/:id/finish` - Finish a game

## Socket Events

### Matchmaking
- `queue:join` - Join matchmaking queue
- `queue:leave` - Leave queue
- `match:found` - Match found with opponent

### Game Play
- `game:join` - Join game room
- `move` - Send/receive moves
- `chat:message` - Send/receive chat messages

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
- Verify your Atlas credentials in `.env`
- Check if your IP is whitelisted in Atlas Network Access
- Ensure the database name is "nexus"

**Stockfish AI Not Responding:**
- Check browser console for errors
- Ensure stockfish.wasm files are in `public/stockfish/`
- The app should fallback to server-side Stockfish if WASM fails

**Socket Connection Issues:**
- Verify both frontend and backend servers are running
- Check if CLIENT_ORIGIN in `.env` matches frontend URL
- Look for CORS errors in browser console

**Build Errors:**
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 16 or higher
- Check for TypeScript errors in the console

### Performance Tips

- The Stockfish WASM engine runs locally in your browser for fast AI responses
- Game moves are persisted to MongoDB for logged-in users
- Socket connections handle real-time features efficiently

## Deployment

### Frontend Deployment
Simply open [Lovable](https://lovable.dev/projects/d38ba5c3-eb26-46fd-ae50-0f88a1fb5386) and click on Share → Publish.

### Backend Deployment
Deploy the `server/` directory to any Node.js hosting service like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

Make sure to:
1. Set all environment variables
2. Update `CLIENT_ORIGIN` to your deployed frontend URL
3. Ensure MongoDB Atlas allows connections from your hosting provider

### Custom Domain
You can connect a custom domain in Lovable:
1. Navigate to Project → Settings → Domains
2. Click "Connect Domain"
3. Follow the DNS configuration steps

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
