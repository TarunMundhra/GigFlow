# GigFlow Backend

![Node.js](https://img.shields.io/badge/Node.js-20.0-black?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9.1.3-47A248?logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)

GigFlow Backend is the API powering the GigFlow freelance marketplace. It provides user authentication, gig management, bidding workflows, and secure protected routes for the frontend client.

## Why this Backend Exists

This API was built to support the GigFlow frontend with a clean, extensible, and secure service layer. It enables:

- user registration, login, logout, and token refresh
- profile updates and protected user data access
- gig creation, listing, and administrative controls
- bid placement, retrieval, and hiring actions

## Key Features

- JWT-backed authentication middleware for protected routes
- MongoDB data modeling with Mongoose
- RESTful API routes for users, gigs, and bids
- Granular role-aware gig and bid actions
- CORS configuration for local development and Vercel deployment

## API Endpoints

### User Routes

- `POST /api/users/auth/register` — register a new user
- `POST /api/users/auth/login` — authenticate and receive a token
- `POST /api/users/auth/logout` — clear auth session (protected)
- `POST /api/users/refresh-token` — refresh access tokens
- `POST /api/users/change-password` — update password (protected)
- `GET /api/users/me` — get current user profile (protected)
- `PATCH /api/users/update-account` — update user account data (protected)

### Gig Routes

- `POST /api/gigs` — create a new gig (protected)
- `GET /api/gigs` — list available gigs
- `GET /api/gigs/:gigId` — fetch gig details (protected)
- `PATCH /api/gigs/:gigId/admins` — manage gig admins (protected)

### Bid Routes

- `POST /api/bids` — place a new bid (protected)
- `GET /api/bids/user` — fetch bids by authenticated user (protected)
- `GET /api/bids/:gigId` — fetch bids for a specific gig (protected)
- `PATCH /api/bids/:bidId/hire` — hire a bidder for a gig (protected)

## Tech Stack

- Node.js
- Express 5
- MongoDB / Mongoose
- JWT authentication
- dotenv for environment configuration
- bcrypt for password hashing

## Design & Development Notes

This backend was built as an express API with production-aware middleware and a clear error-handling strategy. Key design choices include:

- support for both local development and Vercel-hosted frontend origins
- centralized API error handling with `ApiError`
- JSON request parsing with strict size limits
- modular route/controller structure for maintainability

## Challenges & Learnings

- Creating a secure JWT workflow while keeping frontend integration simple
- Designing flexible route authorization for user, gig, and bid actions
- Ensuring consistent error responses for both UI and API clients

## Local Setup

```bash
git clone https://github.com/TarunMundhra/GigFlow.git
cd GigFlow
npm install
```

Create a `.env` file with the following variables:

```env
PORT=5000
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
```

Start the API server:

```bash
npm run dev
```

## Project Structure

- `src/index.js` — application entry point
- `src/app.js` — Express app, middleware, and route registration
- `src/controller/` — request handlers for users, gigs, bids, and hiring
- `src/routes/` — route definitions for user, gig, and bid endpoints
- `src/models/` — Mongoose schemas for users, gigs, and bids
- `src/middlewares/` — auth and other middleware logic
- `src/utils/` — error and response helpers

## Notes

- This backend is designed to pair with the GigFlow frontend application.
- Use `http://localhost:5000/api` as the default API base URL for local development.
