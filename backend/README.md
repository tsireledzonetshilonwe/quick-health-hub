# Quick Health Hub - Backend API

RESTful API backend for the Quick Health Hub health management system. Built with Node.js, Express, TypeScript, Prisma, and MySQL.

## 🚀 Features

- **Session-based Authentication** with HTTP-only cookies
- **Role-based Access Control** (ADMIN, PATIENT roles)
- **MySQL Database** with Prisma ORM
- **RESTful API** design
- **Input Validation** with express-validator
- **Secure Password Hashing** with bcrypt
- **CORS Support** for frontend integration
- **Error Handling** middleware
- **Request Logging** with Morgan
- **TypeScript** for type safety

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ (MySQL Workbench recommended)
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. MySQL Database Setup

#### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Run this SQL command:

```sql
CREATE DATABASE quick_health_hub;
```

4. Note your connection details:
   - Username (usually `root`)
   - Password
   - Host (usually `localhost`)
   - Port (usually `3306`)

### 3. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/quick_health_hub"
SESSION_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
SESSION_MAX_AGE=86400000
```

**Replace `YOUR_PASSWORD` with your actual MySQL root password.**

### 4. Database Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

This will create all tables in your MySQL database.

### 5. Seed Database

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@quickhealth.com` / `admin123`
- Test patient: `patient@test.com` / `patient123`
- Sample appointment and prescription

### 6. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:8080`

## 📚 API Endpoints

### Health Check

```
GET /api/health → 200 OK
```

### Authentication

```
POST /api/auth/signup
Body: { email, password, fullName, phone }
Response: 201 Created → UserDTO

POST /api/auth/login
Body: { email, password }
Response: 200 OK → { user: UserDTO }

POST /api/auth/logout
Response: 200 OK
```

### Users

```
GET    /api/users          → List all users
POST   /api/users          → Create user
GET    /api/users/:id      → Get user by ID
PUT    /api/users/:id      → Update user
DELETE /api/users/:id      → Delete user
GET    /api/users/me?email → Get user by email
PUT    /api/users/me       → Update current user
```

### Appointments (Authenticated)

```
GET    /api/appointments     → User's appointments
POST   /api/appointments     → Create appointment
GET    /api/appointments/:id → Get appointment
PUT    /api/appointments/:id → Update appointment
DELETE /api/appointments/:id → Delete appointment
```

**Create/Update Payload:**
```json
{
  "userId": 1,
  "doctor": "Dr. Smith",
  "specialty": "Cardiology",
  "appointmentDate": "2025-10-20T10:00:00Z",
  "endTime": "2025-10-20T10:30:00Z",
  "reason": "Checkup",
  "status": "PENDING"
}
```

### Prescriptions (Authenticated)

```
GET    /api/prescriptions     → User's prescriptions
POST   /api/prescriptions     → Create prescription
GET    /api/prescriptions/:id → Get prescription
PUT    /api/prescriptions/:id → Update prescription
DELETE /api/prescriptions/:id → Delete prescription
```

**Create/Update Payload:**
```json
{
  "userId": 1,
  "medication": "Aspirin",
  "dosage": "100mg daily",
  "instructions": "Take with food",
  "issuedAt": "2025-10-15T09:00:00Z",
  "expiresAt": "2025-11-15T09:00:00Z",
  "status": "Active"
}
```

### Contact

```
POST /api/contact
Body: { name, email, message }
Response: 201 Created → ContactMessageDTO
```

### Admin Endpoints (ADMIN Role Required)

#### Users
```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
PATCH  /api/admin/users/:id/roles
PATCH  /api/admin/users/:id/activate
PATCH  /api/admin/users/:id/deactivate
DELETE /api/admin/users/:id
```

#### Appointments
```
GET    /api/admin/appointments
GET    /api/admin/appointments/:id
PUT    /api/admin/appointments/:id
DELETE /api/admin/appointments/:id
```

Admin appointment responses include `patientName` and `patientEmail`.

#### Prescriptions
```
GET    /api/admin/prescriptions
GET    /api/admin/prescriptions/:id
PUT    /api/admin/prescriptions/:id
DELETE /api/admin/prescriptions/:id
```

Admin prescription responses include `patientName` and `patientEmail`.

## 🗄️ Database Schema

### User
- id, email (unique), password (hashed), fullName, phone
- roles (array: ADMIN, PATIENT), active (boolean)
- gender, dateOfBirth, address, avatar
- createdAt, updatedAt

### Appointment
- id, userId (FK), doctor, specialty
- appointmentDate, endTime, reason, status
- createdAt, updatedAt

### Prescription
- id, userId (FK), medication, dosage, instructions
- issuedAt, expiresAt, status
- createdAt, updatedAt

### ContactMessage
- id, name, email, message, createdAt

## 📜 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:seed      # Seed database with test data
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🔒 Security Features

- **Bcrypt Password Hashing** (10 rounds)
- **HTTP-only Session Cookies**
- **CORS** restricted to frontend origin
- **Helmet.js** for security headers
- **Input Validation** on all endpoints
- **Role-based Authorization**
- **Secure in Production** (secure cookies when NODE_ENV=production)

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quickhealth.com","password":"admin123"}' \
  -c cookies.txt
```

### Create Appointment (with session)
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"userId":1,"doctor":"Dr. Adams","specialty":"General","appointmentDate":"2025-10-20T10:00:00Z","reason":"Checkup"}'
```

## 🚀 Deployment

### Production Build

```bash
npm run build
NODE_ENV=production npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=your-production-database-url
SESSION_SECRET=strong-random-secret-here
FRONTEND_URL=https://your-frontend-domain.com
SESSION_MAX_AGE=86400000
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 8080
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t qhh-backend .
docker run -p 8080:8080 --env-file .env qhh-backend
```

## 🛠️ Database Management

### View Database
```bash
npm run prisma:studio
```

### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
npx prisma migrate reset
npm run prisma:seed
```

## 📝 Notes

- All dates use ISO-8601 format (e.g., `2025-10-17T10:00:00Z`)
- Session cookies expire after 24 hours (configurable)
- Admin role required for `/api/admin/*` endpoints
- Authentication required for appointments and prescriptions
- CORS configured for `http://localhost:5173` (frontend dev server)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Quick Health Hub Backend** - Secure, scalable health management API
