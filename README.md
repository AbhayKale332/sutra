# Sutra (URL Shortener)

Sutra is a full-stack, responsive URL shortening application built using a Spring Boot backend and a React.js frontend. It allows users to register, create customized short links, and track deep analytics on their links including total historical clicks and performance over time.

## 🚀 Technology Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Java 21, Spring Boot, Spring Security (JWT Authentication)
* **Database:** MySQL (Local or Aiven Cloud)

## 🌐 Deployment (Production)

This project is configured to be deployed on **Render** (Backend) and **Vercel** (Frontend).

### Environment Variables
For a successful deployment, you **must** set the following environment variables in your hosting provider's dashboard:

#### Backend (Spring Boot on Render)
- `DB_URL`: JDBC URL for your MySQL instance (e.g., Aiven).
- `DB_USERNAME`: Database username.
- `DB_PASSWORD`: Database password.
- `JWT_SECRET`: A secure 256-bit base64 string for token signing.
- `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://sutra.vercel.app`).

#### Frontend (React on Vercel)
- `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://sutra-api.onrender.com`).

---

## 💻 Getting Started (Local Development)

To run this project locally, you can now use a `.env` file in the root or set these environment variables in your shell.

### 1. Database Configuration
Ensure MySQL is running on your system, and then create a new database for the application.

### 2. Start the Backend (Spring Boot)
```bash
# Set environment variables before running
export DB_URL=jdbc:mysql://localhost:3306/urlshortenerdb
export DB_USERNAME=root
export DB_PASSWORD=your_password
export JWT_SECRET=your_secret
export FRONTEND_URL=http://localhost:5173

cd url-shortener-sb
./mvnw spring-boot:run
```

### 3. Start the Frontend (React)
```bash
cd url-shortener-react
# Ensure .env is present with VITE_BACKEND_URL=http://localhost:8080
npm install
npm run dev
```

