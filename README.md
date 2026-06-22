# AI Travel Planner

An intelligent travel planning application that uses Google Gemini AI to create personalized itineraries, manage budgets, and generate packing lists.

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- Context API for state management

**Backend:**
- Node.js + Express
- MongoDB for database
- JWT for authentication
- Google Gemini API for AI features
- Bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (Atlas or local)
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
JWT_EXPIRES=7d
GEMINI_MODEL=gemini_model
CLIENT_ORIGIN=http://localhost:5173
```

Run:
```bash
npm start
```

Backend runs on `http://localhost:4000/api`

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:4000/api
```

Run:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
backend/
├── config/          # Database config
├── controllers/     # Route logic (auth, trips)
├── models/          # User & Trip schemas
├── middlewares/     # Auth & error handling
├── routes/          # API routes
└── utils/           # Helper functions (token, Gemini client)

frontend/
├── src/
│   ├── pages/       # Login, Register, Dashboard, NewTrip, TripDetail
│   ├── components/  # Navbar, DayCard, PackingChecklist, etc.
│   ├── context/     # AuthContext for state
│   ├── api/         # Axios client with interceptors
│   └── data/        # Constants & configuration
```

## Key Features

 **User Authentication** - Secure JWT-based login/register with token validation  
 **AI Trip Planning** - Gemini AI generates day-by-day itineraries with activities & costs  
 **Budget Management** - Tracks accommodation, food, activities, transport, and total  
 **Packing List** - AI-generated packing lists with toggle checkboxes  
 **Day Regeneration** - Regenerate individual days with custom feedback  
 **Protected Routes** - Automatic redirection for unauthenticated users  
 **Loading & Error States** - Comprehensive UI feedback for all API calls  
 **Persistent Sessions** - Remember users across browser refresh  

## API Endpoints

**Auth:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)

**Trips:**
- `GET /trips` - List all user trips (protected)
- `POST /trips` - Create new trip (protected)
- `GET /trips/:id` - Get trip details (protected)
- `PUT /trips/:id` - Update itinerary/packing list (protected)
- `DELETE /trips/:id` - Delete trip (protected)
- `POST /trips/:id/regenerate-day` - Regenerate day with AI (protected)

## Authentication Flow

1. User registers/logs in → JWT token stored in localStorage
2. Token automatically attached to all API requests via Axios interceptor
3. On app load, token validated with `/auth/me` endpoint
4. Invalid/expired tokens automatically cleared and user redirected to login
5. Logged-in users accessing `/login` or `/register` auto-redirect to dashboard

## Notes

- All trip operations require authentication
- Gemini AI generates prompts based on destination, duration, budget tier, and interests
- Budget breakdown is calculated per activity and aggregated per category
- Day regeneration requires AI backend access (not available in demo mode)

## Development

Frontend linting:
```bash
cd frontend && npm run lint
```

Backend runs with:
```bash
cd backend && npm start
```

