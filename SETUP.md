# International Squash Platform - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 16.0.0 or higher
- **MariaDB** 10.5 or higher (or MySQL 8.0+)
- **npm** or **yarn** (usually comes with Node.js)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone/Download the Repository

```bash
cd c:\Users\Lenovo\Desktop\Isali\Squash\SquashSiteVS
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=squash_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

Create the database in MariaDB:

```sql
CREATE DATABASE squash_db;
```

Start the development server:

```bash
npm run dev
```

Server will run on: **http://localhost:5000**

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🎯 Application URLs

- **Frontend Home**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

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
- `POST /api/tournaments` - Create new tournament (Organizers only)
- `PUT /api/tournaments/:id` - Update tournament

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id/score` - Update match score

### Rankings
- `GET /api/rankings/world` - Get world rankings
- `GET /api/rankings/regional/:region` - Get regional rankings
- `GET /api/rankings/player/:playerId` - Get player ranking history

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue details
- `POST /api/venues` - Create new venue (Organizers/Regulators only)
- `PUT /api/venues/:id` - Update venue

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔐 Default Test Accounts

Once the application is running, you can register new accounts:

**Registration Roles:**
- `viewer` - Watch matches and follow players
- `player` - Compete in tournaments
- `coach` - Manage and train players
- `organiser` - Create and organize tournaments
- `regulator` - Handle memberships and discipline

## 📊 Database Schema

The application uses the following core tables:

- **users** - User accounts and authentication
- **players** - Player profiles and statistics
- **coaches** - Coach information and certifications
- **tournaments** - Tournament details and scheduling
- **matches** - Match information and scores
- **rankings** - Player rankings across different categories
- **venues** - Physical venue information
- **courts** - Individual court details
- **player_coaches** - Relationship between players and coaches

## 🛠️ Development Tips

### Backend Development
- Backend code is in `backend/src/`
- Routes are in `backend/src/routes/`
- Models are in `backend/src/models/`
- Middleware is in `backend/src/middleware/`
- Environment configuration in `backend/config/`

### Frontend Development
- Frontend code is in `frontend/src/`
- React components in `frontend/src/components/`
- Pages in `frontend/src/pages/`
- Authentication context in `frontend/src/context/`
- API services in `frontend/src/services/`

### Hot Reloading
- Both frontend and backend support hot reloading during development
- Changes to files will automatically refresh/restart servers

## 🐛 Troubleshooting

### Backend Won't Start
1. Check if MariaDB is running
2. Verify `.env` file has correct database credentials
3. Ensure port 5000 is not in use: `netstat -ano | findstr :5000`

### Frontend Won't Start
1. Clear node_modules: `rm -r node_modules` then `npm install`
2. Check if port 5173 is in use
3. Clear browser cache and cookies

### Database Connection Error
1. Verify MariaDB is running
2. Check database exists: `squash_db`
3. Verify user permissions
4. Test connection: `mysql -u root -p squash_db`

### CORS Errors
1. Ensure frontend URL is correct in backend `.env`
2. Check that both servers are running
3. Verify API proxy is configured correctly in `frontend/vite.config.js`

## 📦 Building for Production

### Backend
```bash
cd backend
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output will be in dist/ folder
```

## 🚀 Deployment

### Using Docker (Optional)

Create a `Dockerfile` in the backend root:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t squash-backend .
docker run -p 5000:5000 --env-file .env squash-backend
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review error messages in console
3. Check the project README.md
4. Create an issue on GitHub

## 📝 License

This project is licensed under the MIT License.

---

**Happy Squashing! 🎾**
