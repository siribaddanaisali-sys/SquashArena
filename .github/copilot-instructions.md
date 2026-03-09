# International Squash Platform - Development Guide

This is a comprehensive full-stack application for managing international squash tournaments and player rankings.

## Project Overview

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + Sequelize ORM
- **Database**: MariaDB
- **Real-time**: Socket.io for live match updates

## Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your MariaDB credentials
npm run dev  # Starts on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

## Key Features

### User Roles
- Player: Compete, track stats, view rankings
- Coach: Manage players, create training plans
- Viewer: Follow matches, watch live scores
- Organiser: Create and manage tournaments
- Regulator: Handle memberships and discipline

### API Routes
- `/api/auth` - Authentication (register, login)
- `/api/players` - Player profiles and rankings
- `/api/tournaments` - Tournament management
- `/api/matches` - Match scoring and scheduling
- `/api/rankings` - Global rankings
- `/api/venues` - Venue management

## Database Schema

**Core Tables**:
- users (email, roles, profiles)
- players (rankings, stats)
- coaches (certifications, specialization)
- tournaments (brackets, scheduling)
- matches (scores, results)
- rankings (world/regional/national)
- venues & courts

**Junction Tables**:
- player_coaches (many-to-many relationship)

## Development Notes

### Authentication
- JWT-based with 7-day expiry
- Bcryptjs for password hashing
- Role-based middleware for authorization

### Real-time Updates
- Socket.io integration for live match scores
- Automatic broadcasting to match viewers

### Frontend Components
- Layout (Navbar, Footer)
- Pages: Home, Login, Register, Players, Tournaments, Rankings, Dashboard
- Auth context for state management
- Private routes for authenticated pages

## Running Tests

```bash
cd backend
npm test
```

## Deployment

Ensure `.env` files are configured correctly for production environment before deploying.

---

For more details, see the main README.md file.
