# Sutra (URL Shortener)

Sutra is a full-stack URL shortener with authentication, analytics, Redis-backed redirect optimization, and a customizable QR Studio for every generated short link.

## Overview

The project is split into:

- `url-shortener-sb` - Spring Boot backend
- `url-shortener-react` - React + Vite frontend

## Current Features

- User registration and login with JWT authentication
- Create short URLs with optional custom slugs
- Personal dashboard for managing links
- Per-link analytics for the last 7 days
- Redis-backed redirect lookup caching
- Redis click buffering with scheduled sync to MySQL
- QR Studio with live preview and downloadable QR exports
- Preset QR themes, color controls, shape controls, and logo upload
- Spotify link detection with Spotify Code download support

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: Java 21, Spring Boot, Spring Security, JWT
- Database: MySQL
- Cache / Buffer Layer: Redis

## Latest Changes

### Redis Integration

Redis is now part of the runtime architecture, not just an optional add-on.

- Redirect lookups use Spring caching with Redis via `@Cacheable`
- Clicks are buffered in Redis instead of writing to MySQL on every redirect
- Buffered clicks are flushed to MySQL on a scheduled interval
- Redis keys use TTLs to avoid stale buffered data accumulating
- If Redis has an error, the backend logs it and falls back safely instead of failing user requests

This improves redirect performance and reduces write pressure on MySQL.

### Updated QR Studio

The dashboard QR experience has been expanded significantly.

- Live QR preview inside the dashboard
- Quick theme presets
- Foreground and background color pickers
- Pattern and corner style controls
- Square, rounded, and circular frame options
- Adjustable export resolution
- Logo upload with size control
- PNG download for the customized QR code
- Spotify-specific code download for Spotify links

## Deployment

This project is set up to run with:

- Backend on Render
- Frontend on Vercel
- MySQL as the primary database
- Redis for caching and click buffering

## Environment Variables

### Backend (`url-shortener-sb`)

- `DB_URL` - JDBC URL for MySQL
- `DB_USERNAME` - MySQL username
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - secret used for signing JWTs
- `FRONTEND_URL` - frontend origin allowed by the backend
- `REDIS_URL` - Redis connection URL
- `APP_CLICK_SYNC_INTERVAL_MS` - optional override for click sync interval in milliseconds

### Frontend (`url-shortener-react`)

- `VITE_BACKEND_URL` - backend base URL, for example `http://localhost:8080`

## Local Development

### Prerequisites

- Java 21
- Node.js and npm
- MySQL running locally or remotely
- Redis running locally or remotely

### 1. Start MySQL and Redis

Make sure both services are available before starting the backend.

Example local Redis URL:

```bash
redis://localhost:6379
```

### 2. Start the Backend

```bash
export DB_URL=jdbc:mysql://localhost:3306/urlshortenerdb
export DB_USERNAME=root
export DB_PASSWORD=your_password
export JWT_SECRET=your_secret
export FRONTEND_URL=http://localhost:5173
export REDIS_URL=redis://localhost:6379

cd url-shortener-sb
./mvnw spring-boot:run
```

The backend runs on `http://localhost:8080`.

### 3. Start the Frontend

Create a `.env` file inside `url-shortener-react` with:

```env
VITE_BACKEND_URL=http://localhost:8080
```

Then run:

```bash
cd url-shortener-react
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Notes

- Redis is required for the current backend flow because caching and click buffering are active features.
- Click analytics are persisted to MySQL after the configured sync interval, so totals may update in small batches instead of instantly on every redirect.
