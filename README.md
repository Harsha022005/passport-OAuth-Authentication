# Passport OAuth Authentication

This project implements user authentication using **Passport.js** with **Local Strategy** and **Google OAuth 2.0**. It uses **Express.js**, **PostgreSQL**, and **bcrypt** for user management.

## Features
- User signup with email and password
- Local authentication using Passport.js
- Google OAuth 2.0 authentication
- Session management with `express-session`
- Protected route (`/dashboard`) for authenticated users
- Logout functionality

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** Passport.js (Local & Google OAuth)
- **Security:** bcrypt for password hashing

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Harsha022005/passport-OAuth-Authentication.git
cd passport_oauth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: process.env.DB_PORT,
SESSION_SECRET=your_secret_key
```

### 4. Setup PostgreSQL Database
```sql
CREATE DATABASE Authentication;
CREATE TABLE users_auth (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255)
);
```

### 5. Run the Server
```bash
nodemon server.js
```
Server will start at `http://localhost:3000`.

## API Endpoints

### User Authentication
- **Signup:** `POST /signup` (Registers a new user)
- **Login:** `POST /login` (Authenticates a user)
- **Google OAuth:** `GET /auth/google` (Redirects to Google login)
- **Google OAuth Callback:** `GET /auth/google/callback` (Handles Google login response)
- **Logout:** `GET /logout` (Logs out the user)

### Protected Routes
- **Dashboard:** `GET /dashboard` (Accessible only to authenticated users)

## Notes
- Ensure your Google OAuth credentials are set up in the [Google Developer Console](https://console.cloud.google.com/).
- Use `bcrypt` for password hashing in local authentication.
- Sessions are managed using `express-session`.

