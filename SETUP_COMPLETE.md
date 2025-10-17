# Quick Health Hub - Complete Setup Guide

## 🎉 Project Status: READY!

Your Quick Health Hub application now has a complete Node.js backend connected to MySQL!

---

## 🏗️ Architecture

**Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend:** Node.js + Express + TypeScript + Prisma  
**Database:** MySQL (via MySQL Workbench)  
**Authentication:** Session-based with HTTP-only cookies

---

## 🚀 Running the Application

### Backend Server (Port 8080)

```bash
cd backend
./start-server.sh
```

Or:

```bash
cd backend
npm run dev
```

The backend will start on **http://localhost:8080**

### Frontend App (Port 5173)

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔑 Test Accounts

### Admin User
- **Email:** `admin@quickhealth.com`
- **Password:** `admin123`
- **Roles:** ADMIN, PATIENT
- **Access:** Full access to admin panel + all patient features

### Patient User
- **Email:** `patient@test.com`
- **Password:** `patient123`
- **Roles:** PATIENT
- **Access:** Appointments, Prescriptions, Profile

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Health Check
```bash
curl http://localhost:8080/api/health
# Returns: OK
```

### Authentication

**Signup:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "phone": "+1234567890"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@quickhealth.com",
    "password": "admin123"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -b cookies.txt
```

### Appointments (Authenticated)

**Get User's Appointments:**
```bash
curl http://localhost:8080/api/appointments \
  -b cookies.txt
```

**Create Appointment:**
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": 1,
    "doctor": "Dr. Sarah Smith",
    "specialty": "Cardiology",
    "appointmentDate": "2025-10-25T10:00:00Z",
    "endTime": "2025-10-25T10:30:00Z",
    "reason": "Annual checkup",
    "status": "PENDING"
  }'
```

### Prescriptions (Authenticated)

**Get User's Prescriptions:**
```bash
curl http://localhost:8080/api/prescriptions \
  -b cookies.txt
```

**Create Prescription:**
```bash
curl -X POST http://localhost:8080/api/prescriptions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": 1,
    "medication": "Aspirin",
    "dosage": "100mg daily",
    "instructions": "Take with food",
    "issuedAt": "2025-10-17T09:00:00Z",
    "expiresAt": "2025-11-17T09:00:00Z",
    "status": "Active"
  }'
```

### Admin Endpoints (ADMIN Role Required)

**Get All Users:**
```bash
curl http://localhost:8080/api/admin/users \
  -b cookies.txt
```

**Get All Appointments (with patient info):**
```bash
curl http://localhost:8080/api/admin/appointments \
  -b cookies.txt
```

**Get All Prescriptions (with patient info):**
```bash
curl http://localhost:8080/api/admin/prescriptions \
  -b cookies.txt
```

---

## 🗄️ Database Management

### View Database in MySQL Workbench

1. Open MySQL Workbench
2. Connect to `localhost:3306`
3. Select `quick_health_hub` database
4. View tables:
   - `users`
   - `appointments`
   - `prescriptions`
   - `contact_messages`

### Prisma Studio (GUI Database Editor)

```bash
cd backend
npm run prisma:studio
```

Opens at **http://localhost:5555**

### Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Re-seed database
npm run prisma:seed
```

---

## 📂 Project Structure

```
quick-health-hub/
├── backend/                 # Node.js Backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── routes/         # API routes
│   │   └── server.ts       # Main server file
│   ├── .env                # Environment variables
│   ├── package.json
│   └── README.md
├── src/                     # React Frontend
│   ├── components/
│   ├── pages/
│   │   ├── admin/          # Admin dashboard
│   │   ├── Appointments.tsx
│   │   ├── Prescriptions.tsx
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   └── lib/
│       └── api.ts          # API client
└── package.json
```

---

## 🔧 Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=8080
DATABASE_URL="mysql://root:password@localhost:3306/quick_health_hub"
SESSION_SECRET=your-secret-key-change-this-in-production-12345
FRONTEND_URL=http://localhost:5173
SESSION_MAX_AGE=86400000
```

### Frontend (vite.config.ts)

The frontend is configured to proxy API requests to the backend:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

---

## 🧪 Testing the Integration

1. **Start Backend:**
   ```bash
   cd backend && ./start-server.sh
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Login:**
   - Go to http://localhost:5173
   - Click "Sign in"
   - Use: `admin@quickhealth.com` / `admin123`

4. **Test Features:**
   - View dashboard with appointments and prescriptions
   - Create new appointment
   - Create new prescription
   - Access admin panel (Admin role only)
   - View all users, appointments, prescriptions

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** Port 8080 in use  
**Solution:** Change `PORT=8081` in `backend/.env`

**Problem:** Database connection error  
**Solution:** Verify MySQL is running and credentials in `.env` are correct

### Frontend can't connect to backend

**Problem:** CORS errors  
**Solution:** Check `FRONTEND_URL` in `backend/.env` matches your frontend URL

**Problem:** 401 Unauthorized  
**Solution:** Login first, cookies must be enabled

### Database issues

**Problem:** Tables not created  
**Solution:** Run `cd backend && npm run prisma:migrate`

**Problem:** No test data  
**Solution:** Run `cd backend && npm run prisma:seed`

---

## 📚 Additional Resources

- **Backend README:** `backend/README.md`
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com
- **MySQL Docs:** https://dev.mysql.com/doc

---

## 🎯 Next Steps

1. ✅ Both servers are running
2. ✅ Database is seeded with test data
3. ✅ Test login and features
4. 🔄 Customize UI/UX as needed
5. 🔄 Add more features
6. 🔄 Deploy to production

---

## 📝 Notes

- Session cookies expire after 24 hours
- All dates use ISO-8601 format
- Passwords are hashed with bcrypt (10 rounds)
- Admin role required for `/api/admin/*` endpoints
- Patient data includes `patientName` and `patientEmail` in admin views

---

**Happy Coding! 🚀**
