# 🏎️ Sportdle API

A secure RESTful API for an F1-themed Wordle game built with NestJS and MongoDB. Features JWT authentication, Google OAuth 2.0, daily F1 puzzles (drivers, teams, circuits, terms), and comprehensive user statistics tracking. The API uses server-side validation to prevent cheating - the word is never exposed to the frontend.

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb)](https://www.mongodb.com/)

## ✨ Features

- 🔐 **Authentication:** JWT tokens + Google OAuth 2.0
- 🎮 **Daily Puzzles:** F1-themed 5-letter words (drivers, teams, circuits, terms)
- 🛡️ **Secure Validation:** Server-side guess checking (word never exposed)
- 📊 **Statistics:** Games played, win rate, streaks, guess distribution
- ✅ **Production Ready:** Input validation, error handling, CORS, TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd sportdle
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and Google OAuth credentials
```

### Environment Variables

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Sportdle
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=3000
```

### Run

```bash
npm run start:dev
```

API available at: **http://localhost:3000/api**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user (protected)
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Game
- `GET /api/game/today` - Get today's puzzle metadata
- `POST /api/game/validate` - Validate a guess (returns color pattern)
- `POST /api/game/submit` - Submit final game result (protected)
- `GET /api/game/stats` - Get user statistics (protected)

### Admin
- `POST /api/admin/puzzle` - Create new puzzle (protected)
- `GET /api/admin/puzzles` - List all puzzles (protected)
- `GET /api/admin/puzzles/:date` - Get puzzle by date (protected)

📚 **[Full API Documentation (Postman)](https://documenter.getpostman.com/view/your-collection-id)**

## 🎮 How It Works

```
1. Frontend gets puzzle metadata (no word!)
   GET /api/game/today
   
2. User makes a guess
   POST /api/game/validate { guess: "SENNA" }
   
3. Backend returns color pattern
   { result: [🟩🟩🟩🟩🟩], isCorrect: true }
   
4. Repeat until solved or 6 attempts
   
5. Submit final result
   POST /api/game/submit { won: true, attempts: 3 }
```

**Why server-side validation?**
- 🛡️ Prevents cheating (word stays secret)
- ✅ Consistent validation across all clients
- 📊 Track all guesses for analytics

## 🔧 Tech Stack

- **Framework:** NestJS 10.x
- **Database:** MongoDB with Mongoose
- **Language:** TypeScript 5.x
- **Authentication:** JWT, Passport, Google OAuth 2.0
- **Validation:** class-validator, class-transformer
- **Security:** bcrypt password hashing

## 📁 Project Structure

```
src/
├── auth/           # Authentication (JWT, Google OAuth)
├── user/           # User management (internal)
├── game/           # Game logic and validation
├── admin/          # Admin endpoints
└── main.ts         # Application entry point
```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Copy Client ID and Secret to `.env`

[Detailed setup guide →](https://developers.google.com/identity/protocols/oauth2)

## 🧪 Testing

```bash
# Build
npm run build

# Run tests
npm run test

# E2E tests
npm run test:e2e
```

**Quick API Test:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@f1.com","password":"password123"}'

# Get today's puzzle
curl http://localhost:3000/api/game/today

# Validate a guess
curl -X POST http://localhost:3000/api/game/validate \
  -H "Content-Type: application/json" \
  -d '{"puzzleDate":"2025-11-27","guess":"SENNA"}'
```

## 📊 Data Models

**Puzzle:**
```typescript
{
  word: "SENNA",
  date: "2025-11-27",
  category: "driver",
  hint: "Brazilian legend",
  difficulty: "easy"
}
```

**User Stats:**
```typescript
{
  gamesPlayed: 10,
  gamesWon: 8,
  currentStreak: 3,
  maxStreak: 5,
  guessDistribution: { 1: 0, 2: 1, 3: 3, 4: 2, 5: 1, 6: 1 }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

UNLICENSED

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/your-username/sportdle/issues)

---

Built with ❤️ using NestJS
