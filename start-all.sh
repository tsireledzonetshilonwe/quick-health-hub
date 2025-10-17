#!/bin/bash

# Quick Health Hub - Start All Servers

echo "🚀 Starting Quick Health Hub..."
echo ""
echo "Starting Backend (Port 8080)..."
echo "Starting Frontend (Port 5173)..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    jobs -p | xargs kill 2>/dev/null
    exit
}

trap cleanup INT TERM

# Start backend in background
(
    cd backend
    npm run dev
) &

# Wait a moment for backend to start
sleep 2

# Start frontend in background
npm run dev &

# Wait for all background jobs
echo "✅ Both servers started!"
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

wait
