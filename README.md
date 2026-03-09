# International Squash Platform

A comprehensive web application for managing international squash tournaments, players, rankings, and more.

## 🏗️ Project Structure

```
squash-site/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   ├── config/
│   └── package.json
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MariaDB 10.5+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with MariaDB credentials
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📚 Features

### User Roles
- **Players**: Manage profiles, compete in tournaments, track rankings
- **Coaches**: Manage players, create training plans
- **Viewers**: Follow players, watch live scores
- **Organisers**: Create and manage tournaments
- **Regulators**: Manage memberships and disciplinary actions

### Core Features
- User authentication and role-based access control
- Player profiles and statistics
- Tournament management and bracket generation
- Live match scoring and real-time updates (WebSocket)
- World, regional, and national rankings
- Player search and filtering
- Tournament registration and management
- Match scheduling and venue management
- Regulatory compliance tracking

## 🗄️ Database

MariaDB schema includes tables for:
- Users
- Players
- Coaches
- Tournaments
- Matches
- Rankings
- Venues
- Courts
- Regulatory records

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based authorization
- CORS protection
- Helmet.js security headers

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Zustand (state management)
- Recharts (data visualization)

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- MySQL2
- JWT Authentication
- Socket.io (real-time updates)

**Database:**
- MariaDB

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile/:id` - Get user profile

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `PUT /api/players/:id` - Update player profile
- `GET /api/players/rankings/top` - Get top players

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (organizers)
- `PUT /api/tournaments/:id` - Update tournament

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create match
- `PUT /api/matches/:id/score` - Update match score

### Rankings
- `GET /api/rankings/world` - Get world rankings
- `GET /api/rankings/regional/:region` - Get regional rankings
- `GET /api/rankings/player/:playerId` - Get player ranking history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License

## 📞 Support

For issues and questions, please create an issue on GitHub or contact the development team.

---

Built with ❤️ for the global squash community
