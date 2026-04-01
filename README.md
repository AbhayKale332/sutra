# Sutra (URL Shortener)

Sutra is a full-stack, responsive URL shortening application built using a Spring Boot backend and a React.js frontend. It allows users to register, create customized short links, and track deep analytics on their links including total historical clicks and performance over time.

## 🚀 Technology Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Java 21, Spring Boot, Spring Security (JWT Authentication)
* **Database:** MySQL (Local or Aiven Cloud)

---

## 💻 Getting Started (Local Development)

To run this project on your local machine, follow these step-by-step instructions.

### Prerequisites
Make sure you have the following installed on your system:
- **Java 21 Development Kit (JDK)**
- **Node.js** (v16+)
- **MySQL** (or access to a remote cloud MySQL instance)

### 1. Database Configuration
Ensure MySQL is running on your system, and then create a new database for the application:
```sql
CREATE DATABASE IF NOT EXISTS urlshortenerdb;
```

If you are using a local database, update the Spring Boot application configuration file located at `url-shortener-sb/src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/urlshortenerdb
spring.datasource.username=root
spring.datasource.password=your_password
```
*(If you are connecting to a cloud database, simply provide your cloud URL and set the `DATABASE_PASSWORD` environment variable!)*

### 2. Start the Backend (Spring Boot)
Open a terminal, navigate into the backend module, and start the application using Maven.
```bash
# Navigate to backend module
cd url-shortener-sb

# Start the Spring Boot server
./mvnw spring-boot:run
```
The backend API service will compile and begin running safely on `http://localhost:8080`.

### 3. Start the Frontend (React)
Open a second terminal window, navigate into the frontend module, install the NPM dependencies, and spin up the Vite development server.
```bash
# Navigate to frontend module
cd url-shortener-react

# Install required node modules
npm install

# Start the frontend dev server
npm run dev
```
The React application will be up and running! Visit `http://localhost:5173` in your browser to start generating short URLs!
