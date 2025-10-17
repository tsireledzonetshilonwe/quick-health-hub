#!/bin/bash

# Quick Health Hub - Backend Start Script

echo "🚀 Starting Quick Health Hub Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "🔧 Generating Prisma Client..."
    npm run prisma:generate
fi

echo ""
echo "✅ Starting server on http://localhost:8080"
echo "📊 Environment: $(grep NODE_ENV .env | cut -d'=' -f2)"
echo "🗄️  Database: MySQL"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
