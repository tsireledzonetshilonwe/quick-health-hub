# Running Frontend & Backend Together

You have **4 different ways** to run both servers simultaneously:

---

## ⭐ Option 1: Using npm Script (Recommended & Easiest)

### Setup (One-time only)
```bash
# Already installed! concurrently package is ready
```

### Run Both Servers
```bash
npm run dev:all
```

This will start:
- **Backend** on http://localhost:8080 (blue output)
- **Frontend** on http://localhost:5173 (green output)

To stop: Press `Ctrl+C` once (stops both)

---

## 🔧 Option 2: Using Shell Script

### Run
```bash
./start-all.sh
```

This starts both servers in the background.

To stop: Press `Ctrl+C` (kills both processes)

---

## 🖥️ Option 3: Separate Terminals (Manual)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

To stop: Press `Ctrl+C` in each terminal

---

## 📝 Option 4: VS Code Tasks

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Tasks: Run Task"
3. Select: "Start All Servers"

This opens split terminals for backend and frontend.

---

## 🚀 Quick Start Guide

### First Time Setup:
```bash
# 1. Install frontend dependencies (if not already done)
npm install

# 2. Install backend dependencies (if not already done)
cd backend
npm install
cd ..
```

### Start Everything:
```bash
npm run dev:all
```

### What You'll See:
```
[backend] 🚀 Server running on http://localhost:8080
[frontend] ➜  Local:   http://localhost:5173/
```

### Access the App:
Open your browser to: **http://localhost:5173**

The frontend will automatically connect to the backend on port 8080.

---

## 🎯 Recommended Development Workflow

### Daily Development:
```bash
# Start both servers
npm run dev:all

# Open browser
# http://localhost:5173

# Login with test account
# admin@quickhealth.com / admin123
```

### Backend Only:
```bash
cd backend
npm run dev
```

### Frontend Only:
```bash
npm run dev
```

---

## 🛠️ Troubleshooting

### Port Already in Use

**Backend (8080):**
```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9
```

**Frontend (5173):**
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Won't Start

1. Check MySQL is running in MySQL Workbench
2. Verify `.env` in `backend/` folder has correct password
3. Run: `cd backend && npm run prisma:generate`

### Frontend Can't Connect to Backend

1. Make sure backend is running on port 8080
2. Check console for CORS errors
3. Verify `FRONTEND_URL` in `backend/.env` is `http://localhost:5173`

---

## 📊 Available Scripts

### Root Directory (Frontend)
```bash
npm run dev              # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:all          # Start both (recommended!)
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

### Backend Directory
```bash
cd backend
npm run dev              # Start backend with hot reload
npm run build            # Build TypeScript
npm start                # Run production build
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Seed database
```

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Backend running: http://localhost:8080/api/health returns "OK"
- [ ] Frontend running: http://localhost:5173 loads
- [ ] Can login with: `admin@quickhealth.com` / `admin123`
- [ ] Dashboard shows appointments and prescriptions
- [ ] No console errors

---

## 🎨 Output Color Coding

When using `npm run dev:all`:

- 🔵 **Blue** = Backend messages
- 🟢 **Green** = Frontend messages

---

## 💡 Pro Tips

1. **Use `npm run dev:all`** for daily development
2. **Keep terminal visible** to see API requests and errors
3. **Check browser console** for frontend errors
4. **Check terminal** for backend errors
5. **Use MySQL Workbench** or `npm run prisma:studio` to view database

---

## 🔥 Hot Reload

Both servers support hot reload:

- **Frontend:** Vite auto-reloads on file changes
- **Backend:** ts-node-dev auto-restarts on file changes

No need to restart servers during development!

---

**Ready to go? Run:**

```bash
npm run dev:all
```

Then open: **http://localhost:5173** 🚀
