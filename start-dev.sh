#!/bin/bash

# Start both client and server in development mode

echo "🚀 Starting ProdigyPM Development Environment..."

# Start server in background
echo "📦 Starting backend server..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client
echo "🎨 Starting frontend client..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ Development environment started!"
echo "📝 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
